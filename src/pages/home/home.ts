import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { AccountServiceProvider } from '../../providers/account-service/account-service';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { SimpleToastServiceProvider } from '../../providers/simple-toast-service/simple-toast-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  mode: string;
  constructor(public navCtrl: NavController, private events: Events, private accountSvc: AccountServiceProvider, private apiSvc: ApiServiceProvider, private toastSvc: SimpleToastServiceProvider) {
    this.mode = "manipulate";
    if (this.accountSvc.username != undefined && this.accountSvc.password != undefined) {
      this.apiSvc.init();
    } else {
      this.toastSvc.presentOKToast("Please set account on \"Setting\" tab.");
    }
  }

  doRefresh(refresher) {
    console.log("Refresh");
    this.apiSvc.reloadAttribute()
      // .then(() => this.apiSvc.reloadState())
      .then(() => this.apiSvc.reloadStateSequence())
      .then(refresher.complete())
      .catch(err => {
        refresher.complete();
        this.toastSvc.presentToast("ERROR: " + err.status);
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