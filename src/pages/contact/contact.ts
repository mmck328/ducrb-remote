import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SimpleToastServiceProvider } from '../../providers/simple-toast-service/simple-toast-service';

declare var cordovaHTTP: any;
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  some: any;
  hash: any;
  ary: any;
  constructor(public navCtrl: NavController, private toast: SimpleToastServiceProvider) {
    this.some = {field0: "data0"}
    this.hash = {key0: 0, key1: 1}
    this.ary = [{key0: 0}, {key1: 1}]
  }
  private uri = "http://192.168.11.7:4567"

  writesome() {
    this.some.field1 = "data1";
  }

  testget() {
  	cordovaHTTP.get(this.uri, {}, {}, (
        res => {
          this.toast.presentToast(res.data);
        }
      ), (
        error => {
          this.toast.presentToast("Get Failed: " + error);
        }
      ));
  }
  testpost() {
  	cordovaHTTP.postJson(this.uri, {"data" : "post", "data2": [1,2,3]}, {}, (
        res => {
          this.toast.presentToast(res.data);
        }
      ), (
        error => {
          this.toast.presentToast("Post Failed: " + error);
        }
      ));
  }
  testput() {
  	cordovaHTTP.put(this.uri, {"data" : "put", "data2": [4,5,6]}, {}, (
        res => {
          this.toast.presentToast(res.data);
        }
      ), (
        error => {
          this.toast.presentToast("Put Failed: " + error);
        }
      ));
  }
}
