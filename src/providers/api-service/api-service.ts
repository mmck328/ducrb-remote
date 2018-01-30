import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular'
import { HTTP } from '@ionic-native/http';
import { AccountServiceProvider } from '../account-service/account-service';
import { SimpleToastServiceProvider } from '../simple-toast-service/simple-toast-service'
import 'rxjs/add/operator/map';

/*
  Generated class for the ApiServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
function sequenceTasks(tasks) {
  function recordValue(results, value) {
      results.push(value);
      return results;
  }
  var pushValue = recordValue.bind(null, []);
  return tasks.reduce(function (promise, task) {
      return promise.then(task).then(pushValue);
  }, Promise.resolve());
}

const API_ENDPOINT = 'http://172.31.8.129/api/1.0/';
const LIGHT_STATE = 'http://172.27.2.20/';
declare var cordovaHTTP: any;

@Injectable()
export class ApiServiceProvider {
  roomId: string;
  roomAttribute: any;
  lightId: string[];
  lightAttribute: any[];
  lightPower: number[];
  ac: any;
  sensor: {
    id: string,
    name: string,
    value: number,
    timestamp: string
  }[];


  debug: boolean;

  constructor(private events: Events, private http: HTTP, private toastSvc: SimpleToastServiceProvider, private accountSvc: AccountServiceProvider) {
    this.http.setDataSerializer('json')
    
    this.roomId = "A305";
    this.lightId = new Array(5);
    this.lightAttribute = new Array(5);
    this.lightPower = new Array(0, 0, 0, 0, 0);
    this.ac = new Array();

    this.debug = false;
    if (this.debug) {
      this.roomAttribute = JSON.parse("{\"ucode\":\"00001C000000000000020000000D4505\",\"name\":\"A305\",\"device\":[{\"ucode\":\"00001C000000000000020000000D4555\",\"type\":\"Air Conditioner\",\"name\":\"AC-RoomA305-2\"},{\"ucode\":\"00001C000000000000020000000D4556\",\"type\":\"Air Conditioner\",\"name\":\"AC-RoomA305-1\"},{\"ucode\":\"00001C000000000000020000000D4578\",\"type\":\"Air Conditioner\",\"name\":\"H-RoomA305\"},{\"ucode\":\"00001C000000000000020000000D44F6\",\"type\":\"Light\",\"name\":\"LightRoomA305\"},{\"ucode\":\"00001C000000000000020000000D448A\",\"type\":\"Light\",\"name\":\"LightRoomA305-4\"},{\"ucode\":\"00001C000000000000020000000D448B\",\"type\":\"Light\",\"name\":\"LightRoomA305-3\"},{\"ucode\":\"00001C000000000000020000000D448C\",\"type\":\"Light\",\"name\":\"LightRoomA305-2\"},{\"ucode\":\"00001C000000000000020000000D448D\",\"type\":\"Light\",\"name\":\"LightRoomA305-1\"},{\"ucode\":\"00001C0000000000000200000006343F\",\"type\":\"Sensor\",\"name\":\"TempRoomA305\"},{\"ucode\":\"00001C00000000000002000000063440\",\"type\":\"Sensor\",\"name\":\"HumidRoomA305\"},{\"ucode\":\"00001C00000000000002000000063441\",\"type\":\"Sensor\",\"name\":\"DetectRoomA305\"},{\"ucode\":\"00001C000000000000020000000D45C2\",\"type\":\"Smartmeter\",\"name\":\"3L-6\"}]}");
      this.ac = JSON.parse("[{\"id\":\"00001C000000000000020000000D4555\",\"attribute\":{\"ucode\":\"00001C000000000000020000000D4555\",\"name\":\"AC-RoomA305-2\",\"type\":\"air conditioner\",\"room\":\"A305\",\"power\":{\"on\":1,\"off\":0},\"set_temp\":{\"20\":20,\"21\":21,\"22\":22,\"23\":23,\"24\":24,\"25\":25,\"26\":26,\"27\":27,\"28\":28},\"fan_speed\":{\"Low\":0,\"Middle\":1,\"High\":2},\"fan_direction\":{\"Position-0\":0,\"Position-1\":1,\"Position-2\":2,\"Position-3\":3,\"Position-4\":4,\"Swing\":7}},\"state\":{\"ucode\":\"00001C000000000000020000000D4555\",\"name\":\"AC-RoomA305-2\",\"type\":\"air conditioner\",\"power\":1,\"set_temp\":26,\"room_temp\":26.703125,\"fan_speed\":1,\"fan_direction\":7}},{\"id\":\"00001C000000000000020000000D4556\",\"attribute\":{\"ucode\":\"00001C000000000000020000000D4556\",\"name\":\"AC-RoomA305-1\",\"type\":\"air conditioner\",\"room\":\"A305\",\"power\":{\"on\":1,\"off\":0},\"set_temp\":{\"20\":20,\"21\":21,\"22\":22,\"23\":23,\"24\":24,\"25\":25,\"26\":26,\"27\":27,\"28\":28},\"fan_speed\":{\"Low\":0,\"Middle\":1,\"High\":2},\"fan_direction\":{\"Position-0\":0,\"Position-1\":1,\"Position-2\":2,\"Position-3\":3,\"Position-4\":4,\"Swing\":7}},\"state\":{\"ucode\":\"00001C000000000000020000000D4556\",\"name\":\"AC-RoomA305-1\",\"type\":\"air conditioner\",\"power\":1,\"set_temp\":26,\"room_temp\":26.609375,\"fan_speed\":1,\"fan_direction\":7}}]");
    }
  }

  init() {
    this.getRoomAttribute()
      .then(() => this.reloadAttribute())
      // .then(() => this.reloadState())
      .then(() => this.reloadStateSequence())
      // .then()
      .catch(err => console.log(err));
  }

  getRoomAttribute() {
    let uri = API_ENDPOINT + 'rooms/' + this.roomId + '/attribute';
    return new Promise<void>((resolve, reject) => {
      this.accountSvc.getToken()
        .then(token => {
          let header = { "X-UIDC-Authorization-Token": token };
          return this.http.get(uri, {}, header);
        })
        .then(res => {
          this.roomAttribute = JSON.parse(res.data);
          this.lightId = this.roomAttribute.device.filter(item => item.type == "Light").map(item => item.ucode);
          this.ac = this.roomAttribute.device.filter(item => item.type == "Air Conditioner").map(item => {return {id: item.ucode}});
          this.sensor = this.roomAttribute.device.filter(item => item.type == "Sensor").map(item => {return {id: item.ucode, name: item.name, value: undefined}});
          console.log("roomAttribute = " + JSON.stringify(this.roomAttribute));
          console.log("lightId = " + this.lightId);
          console.log("sensor = " + JSON.stringify(this.sensor));
          resolve();
        })
        .catch(err => {
          this.toastSvc.presentOKToast("Failed to get room attribute (" + this.roomId + ") : " + err);
          reject(err);
        });
    });
  }

  reloadAttribute(force: boolean = false) {
    console.log(JSON.stringify(this.ac));
    let promises = [];
    // this.lightId.forEach((id, index) => {
    //   promises.push(this.getLightAttribute(index));
    // });
    this.ac.forEach((aircon, index) => {
      if (force || (aircon.attribute === undefined)) {
        promises.push(this.getAcAttribute(index));
      }
    });
    return new Promise<void>((resolve, reject) => {
      Promise.all(promises)
        .then(() => {resolve();})
        .catch(err => reject(err));
    });

  }

  reloadState() {
    let promises = [];
    // this.lightId.forEach((id, index) => {
    //   promises.push(this.getLightState(index));
    // });
    promises.push(this.getAllLightState());
    this.ac.forEach((aircon, index) => {
      promises.push(this.getAcState(index));
    });
    this.sensor.forEach((sens, index) => {
      promises.push(this.getSensorState(index));
    });
    return new Promise<void>((resolve, reject) => {
      Promise.all(promises)
        .then(() => resolve())
        .catch(err => reject(err));
      });
  }

  reloadStateSequence() {
    let tasks = [];
    // this.lightId.forEach((id, index) => {
    //   tasks.push(() => this.getLightState(index));
    // });
    tasks.push(() => this.getAllLightState());
    this.ac.forEach((aircon, index) => {
      tasks.push(() => this.getAcState(index));
    });
    this.sensor.forEach((sens, index) => {
      tasks.push(() => this.getSensorState(index));
    });

    sequenceTasks(tasks);
  }

  getLightAttribute(index: number) {
    let uri = API_ENDPOINT + 'lights/' + this.lightId[index] + '/attribute';
    return new Promise<void>((resolve, reject) => {
      this.accountSvc.getToken()
        .then(token => {
          let header = { "X-UIDC-Authorization-Token": token };
          return this.http.get(uri, {}, header);
        })
        .then(res => {
          this.lightAttribute[index] = JSON.parse(res.data);
          resolve();
        })
        .catch(err => {
          console.log("Failed to get light attribute (" + index + ") : " + err);
          reject(err);
        });
    });
    
  }

  getAcAttribute(index: number) {
    let uri = API_ENDPOINT + 'air_conditioners/' + this.ac[index].id + '/attribute';
    return new Promise<void>((resolve, reject) => {
      this.accountSvc.getToken()
        .then(token => {
          let header = { "X-UIDC-Authorization-Token": token };
          return this.http.get(uri, {}, header);
        })
        .then(res => {
          this.ac[index].attribute = JSON.parse(res.data);
          console.log("ac[" + index + "].attribute updated : " + res.data);
          resolve();
        })
        .catch(err => {
          console.log("Failed to get AC attribute (" + index + ") : " + err.status);
          reject(err);
        });
    });
  }

  getAcState(index: number) {
    let uri = API_ENDPOINT + 'air_conditioners/' + this.ac[index].id + '/state';
    return new Promise<void>((resolve, reject) => {
      this.accountSvc.getToken()
        .then(token => {
          let header = { "X-UIDC-Authorization-Token": token };
          return this.http.get(uri, {}, header);
        })
        .then(res => {
          this.ac[index].state = JSON.parse(res.data);
          console.log("ac[" + index + "].state updated");
          resolve();
        })
        .catch(err => {
          console.log("Failed to get ac state (" + index + ") : " + err);
          reject(err);
        });
    }); 
  }

  putAcState(index: number) {
    let uri = API_ENDPOINT + 'air_conditioners/' + this.ac[index].id + '/state';
    let body = this.ac[index].state;
    return new Promise<void>((resolve, reject) => {
      this.accountSvc.getToken()
        .then(token => {
          let header = { 
                         "X-UIDC-Authorization-Token": token, 
                         "Content-Type": "application/json" 
                       };
          return this.http.put(uri, body, header);
        })
        .then(res => {
          console.log("putAcState(" +  index + ") successed. API returned \n" + res.data);
          resolve();
          // this.getLightState(index).then().catch();
        })
        .catch(res => {
          console.log("Failed to put Ac state (" + index + ") : " + res.error);
          reject(res.error);
        });
    });
  }  

  getAllLightState() {
    let uri = LIGHT_STATE;
    return new Promise<void>((resolve, reject) => {
      this.http.get(uri, {}, {})
        .then(res => {
          let lights = JSON.parse(res.data);
          lights.forEach((light, index) => {
            this.lightPower[index] = light.power;
          });
          resolve();
        })
        .catch(err => {
          console.log("Failed to get all light state  : " + err);
          reject(err);
        })
    });
  }

  getLightState(index: number) {
    let uri = API_ENDPOINT + 'lights/' + this.lightId[index] + '/state';
    return new Promise<void>((resolve, reject) => {
      this.accountSvc.getToken()
        .then(token => {
          let header = { "X-UIDC-Authorization-Token": token };
          return this.http.get(uri, {}, header);
        })
        .then(res => {
          this.lightPower[index] = JSON.parse(res.data).power;
          console.log("lightPower[" + index + "] = " + this.lightPower[index]);
          resolve();
        })
        .catch(err => {
          console.log("Failed to get light state (" + index + ") : " + err);
          reject(err);
        });
    }); 
    // this.accountSvc.getToken()
    //   .then(token => {
    //     let header = { "X-UIDC-Authorization-Token": token };
    //     return this.http.get(uri, {}, header);
    //   })
    //   .then(res => {
    //     this.lightPower[index] = JSON.parse(res.data).power;
    //     console.log("lightPower[" + index + "] = " + this.lightPower[index]);
    //   })
    //   .catch(err => console.log("Failed to get light state (" + index + ") : " + err));
  }

  putLightState(index: number, value: number) {
    let uri = API_ENDPOINT + 'lights/' + this.lightId[index] + '/state';
    let body = { "power": value }
   // let toaststr = typeof(<any>window) + typeof((<any>window).cordovaHTTP) + typeof((<any>window).cordovaHTTP.put()) + typeof(cordovaHTTP) + typeof(cordovaHTTP.put());
    //this.toastSvc.presentOKToast(toaststr);
    return new Promise<void>((resolve, reject) => {
      this.accountSvc.getToken()
        .then(token => {
          let header = { "X-UIDC-Authorization-Token": token };
          return this.http.put(uri, body, header);
        })
        .then(res => {
          console.log("putLightState(" +  index + ", " + value + ") successed. API returned \n" + res.data);
          resolve();
            // this.getLightState(index).then().catch();
        })
        .catch(res => {
          console.log("Failed to put light power (" + index + ") to be " + value + " : " + res.error);
          reject(res.error);
        });
    });

    // return new Promise<number>((resolve, reject) => {
    //   cordovaHTTP.put(uri, body, header,
    //     (res => {resolve(JSON.parse(res.data).power)}), 
    //     (res => {reject("Failed to put light state (" + id + ") : " + res.error)}));
    // });
  }

  getSensorState(index) {
    let uri = API_ENDPOINT + 'sensors/' + this.sensor[index].id + '/state';
    return new Promise<void>((resolve, reject) => {
      this.accountSvc.getToken()
        .then(token => {
          let header = { "X-UIDC-Authorization-Token": token };
          return this.http.get(uri, {}, header);
        })
        .then(res => {
          this.sensor[index].value = JSON.parse(res.data).value;
          this.sensor[index].timestamp = JSON.parse(res.data).timestamp;
          console.log("sensor[" + index + "].value = " + this.sensor[index].value);
          resolve();
        })
        .catch(err => {
          console.log("Failed to get sensor state (" + index + "/" + this.sensor[index].name + ") : " + err);
          reject(err);
        });
    }); 
  }

}
