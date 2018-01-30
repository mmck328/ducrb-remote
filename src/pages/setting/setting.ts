import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { AccountServiceProvider } from '../../providers/account-service/account-service';
import { SimpleToastServiceProvider } from '../../providers/simple-toast-service/simple-toast-service';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html'
})
export class SettingPage {
  // username: string;
  // password: string;

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private accountSvc: AccountServiceProvider, private toastSvc: SimpleToastServiceProvider) {
  }

  presentAlert() {
    this.alertCtrl.create({
      title: 'pushed',
      subTitle: 'hey!',
      buttons: ['OK']
    }).present();
  }

  onPushed() {
    this.accountSvc.setAccount(this.accountSvc.username, this.accountSvc.password);
    this.toastSvc.presentOKToast("Account set to \"" + this.accountSvc.username + "\"");
    this.accountSvc.getToken().catch(err => {
      this.toastSvc.presentOKToast(err);
    });
  }

}
