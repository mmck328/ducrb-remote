import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import { Events } from 'ionic-angular'
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import { SimpleToastServiceProvider } from '../simple-toast-service/simple-toast-service'
import 'rxjs/add/operator/map';

/*
  Generated class for the AccountServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

const API_ENDPOINT = 'http://172.31.8.129/api/1.0/'

@Injectable()
export class AccountServiceProvider {
  username: string;
  password: string;
  token: any;
  timeAcquired: Date;
  storage: SecureStorageObject;

  constructor(private events: Events, private http: HTTP, private secureStorage: SecureStorage, private toastSvc: SimpleToastServiceProvider) {
    this.token = null;
    this.timeAcquired = new Date(0);
    document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
  }

  onDeviceReady() {
    console.log("device ready");

    this.secureStorage.create('DUCRB_API')
      .then((storage) => {
        this.storage = storage;
        this.storage.get('username')
          .then((data) => {
            this.username = data;
            console.log('username found: ' + data.toString());
            return this.storage.get('password');
          })
          .then((data) => {
            this.password = data;
            this.events.publish('accountloaded');
          })
          .catch((err) => {
            console.log('account infomation not found');
            this.toastSvc.presentOKToast("Please set account on \"Setting\" tab.");
            console.log(err);
            this.username = null;
            this.password = null;
          });
      })
      .catch((err) => {this.toastSvc.presentOKToast(err)});
  }

  setAccount(user: string, pass: string) {
    console.log("setAccount");
    // this.secureStorage.create('ducrb_ss').then((storage: SecureStorageObject) => this.ss = storage);
    // this.ss.set('username', user)
    //   .then(setuser => {this.ss.set('password', pass); console.log("user set");})
    //   .then(setpass => {this.ss.get('username'); console.log("pass set");})
    //   .then(newuser => console.log("User set to :" + newuser))
    //   .catch(err => console.log("[setAccount] ERROR: " + err));
    this.timeAcquired = new Date(0);
    this.username = user;
    this.password = pass;
    this.storage.set('username', this.username);
    this.storage.set('password', this.password);
    this.events.publish('accountloaded');
  }

  getAccount(user, pass) {

  }

  getToken() {
    return new Promise<string>((resolve, reject) => {
      if (Date.now() - this.timeAcquired.getTime() > 24 * 60 * 60 * 1000) {
        let uri = API_ENDPOINT + 'auth/token';
        // this.token = this.http.get(uri).map(this.extractToken).catch(this.handleError).;
        let body = { "email": this.username }
        let header = { "Content-Type": "application/json" }
        let baseAuthHeader = this.http.getBasicAuthHeader(this.username, this.password);
        Object.assign(header, baseAuthHeader);
        this.http.post(uri, body, header).then(res => {
            this.token = JSON.parse(res.data).token;
            this.timeAcquired = new Date(Date.now());
            console.log("Acquired new token : " + this.token)
            resolve(this.token);
          }
        ).catch(
          error => {
            reject("Failed to get token: " + error.toString());
          }
        );
      } else {
        resolve(this.token);
      }
    });
  }
}
