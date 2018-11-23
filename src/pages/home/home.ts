import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { SimpleToastServiceProvider } from '../../providers/simple-toast-service/simple-toast-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  mode: string;
  constructor(public navCtrl: NavController, private events: Events, private apiSvc: ApiServiceProvider, private toastSvc: SimpleToastServiceProvider) {
    this.mode = "manipulate";
    
    this.events.subscribe('accountloaded', () => { this.apiSvc.init() });
  }

  doRefresh(refresher) {
    console.log("Refresh");
    this.apiSvc.reloadAttributeSequence()
    // .then(() => this.apiSvc.reloadState())
    .then(() => { return this.apiSvc.reloadStateSequence() })
    .then(() => {
      refresher.complete();
      console.log("Refresh complete")
    })
    .catch(err => {
      refresher.complete();
      this.toastSvc.presentToast('ERROR: ' + err.status + ' ' + err.error);
    });
  }

  onLightPushed(index: number) {
    let newVal = this.apiSvc.lightPower[index] ? 0 : 1;
    this.apiSvc.putLightState(index, newVal)
      .then(() => this.apiSvc.lightPower[index] = newVal)
      .catch(err => this.toastSvc.presentToast("Failed to change Light state : "+ err));    
    if (index == 0) this.apiSvc.lightPower.fill(newVal);
  }

  onAcPowerPushed(index: number) {
    this.apiSvc.ac[index].state.power = this.apiSvc.ac[index].state.power ? 0 : 1;
    console.log("[onAcPowerPushed(" + index + ")]: newstate = " + JSON.stringify(this.apiSvc.ac[index].state));
    this.apiSvc.putAcState(index)
      .then(() => {})
      .catch(err => {
        this.toastSvc.presentToast("Failed to change ac power : " + err);
        // this.apiSvc.reloadState().then().catch();
        this.apiSvc.ac[index].state.power = this.apiSvc.ac[index].state.power ? 0 : 1;
      });
  }

  onAcChanged(index: number) {
    this.apiSvc.putAcState(index)
      .then()
      .catch(err => {
        this.toastSvc.presentToast("Failed to change ac temp : " + err);
        this.apiSvc.reloadState().then().catch();
      });
  }

  objToKeys(obj: any) {
    return Object.keys(obj);
  }

}
