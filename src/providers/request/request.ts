import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FCM } from '@ionic-native/fcm';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import * as mapboxgl from 'mapbox-gl';
import { ToastController } from 'ionic-angular';
import { ValidationPath } from '@firebase/database/dist/esm/src/core/util/Path';


@Injectable()
export class RequestProvider {

  userId: any;
  public coID: any;

  constructor(private toastCtrl: ToastController, private afAuth: AngularFireAuth, private fcm: FCM, public http: HttpClient, private afdb: AngularFireDatabase) {
    this.setID();
  }

  setID() {
    return this.userId = this.afAuth.auth.currentUser.uid;
  }

  saveToken() {
    this.fcm.getToken().then(token => {
      return this.afdb.object('profile/' + this.userId).update({
        token: token
      });
    });
  }



  sendRequest(token, coID, hoID) {
    alert('request sent');
    var x = this.afdb.object<any>('requests/' + hoID).valueChanges().subscribe(data => {
      if (data.reqStatus == 'occupied' || data.reqStatus == 'Accepted') {
        alert(data.reqStatus);
      } else {
        x.unsubscribe();
        this.afdb.object('requests/' + hoID).set({
          coID: coID,
          status: "ongoing",
          reqStatus: "occupied"
        });

        let body = {
          "notification": {
            "title": "You have a parking request!",
            "body": "text",
            "sound": "default",
            "click_action": "FCM_PLUGIN_ACTIVITY",
            "icon": "fcm_push_icon"
          },
          "data": {
            "coID": coID,
            "hoToken": token,
            "hoID": hoID
          },
          "to": token,
          "priority": "high",
          "restricted_package_name": ""
        };

        this.showToastRequest;
        let options = new HttpHeaders().set('Content-Type', 'application/json');
        this.http.post("https://fcm.googleapis.com/fcm/send", body, {
          headers: options.set('Authorization', 'key=AAAAQHrZv6o:APA91bFLp4qD4gS00FAYrzzJiCoLwTBm-B9vadJNsMMqblXkjCyCxYcMmPVAsRtMsMTASXbhLN6U_YylRe__2bZw7MKotfghVtfxfHNERoIulwrb1TdMV4cp-jNjxsZ88K-OuLdokxiM'),
        }).subscribe();

      }
    });


  }

  showToastRequest() {
    let toast = this.toastCtrl.create({
      message: 'Request sent!',
      duration: 3000
    })
    toast.present();
  }

  declineRequest(coID, hoID) {

    this.afdb.object('/requests/' + hoID).set({
      coID: "",
      status: "",
      reqStatus: ""
    });

    this.afdb.list('/transactions/' + hoID).push({
      coID: coID,
      status: "rejected"
    });


    this.afdb.object<any>('profile/' + coID).valueChanges()
      .subscribe(data => {
        let body = {
          "notification": {
            "title": "Your request has been declined! :(",
            "body": "text",
            "sound": "default",
            "click_action": "FCM_PLUGIN_ACTIVITY",
            "icon": "fcm_push_icon"
          },
          "data": {
            "status": "declined"
          },
          "to": data.token,
          "priority": "high",
          "restricted_package_name": ""
        }
        let options = new HttpHeaders().set('Content-Type', 'application/json');
        this.http.post("https://fcm.googleapis.com/fcm/send", body, {
          headers: options.set('Authorization', 'key=AAAAQHrZv6o:APA91bFLp4qD4gS00FAYrzzJiCoLwTBm-B9vadJNsMMqblXkjCyCxYcMmPVAsRtMsMTASXbhLN6U_YylRe__2bZw7MKotfghVtfxfHNERoIulwrb1TdMV4cp-jNjxsZ88K-OuLdokxiM'),
        }).subscribe();

      });

    this.afdb.list('transactions/declined').push({
      hoID: hoID,
      coID: coID,
      createdAt: Date.now()
    });


  }

  acceptRequest(coID, hoID) {
    this.afdb.object<any>('/location/' + hoID).valueChanges()
      .subscribe(data => {
        this.afdb.object('requests/' + hoID).update({
          reqStatus: "Accepted",
          motionStatus: "Arriving",
          createdAt: Date.now()
        }).then(() => {
          this.afdb.object<any>('profile/' + coID).valueChanges()
            .subscribe(data2 => {
              let body = {
                "notification": {
                  "title": "Your request has been accepted! c:",
                  "body": "From Ryan Aquino, aldskfjlaskdfj",
                  "sound": "default",
                  "click_action": "FCM_PLUGIN_ACTIVITY",
                  "icon": "fcm_push_icon"
                },
                "data": {
                  "status": "accepted",
                  "lang": data.lng,
                  "latt": data.lat
                },
                "to": data2.token,
                "priority": "high",
                "restricted_package_name": ""
              }
              let options = new HttpHeaders().set('Content-Type', 'application/json');
              this.http.post("https://fcm.googleapis.com/fcm/send", body, {
                headers: options.set('Authorization', 'key=AAAAQHrZv6o:APA91bFLp4qD4gS00FAYrzzJiCoLwTBm-B9vadJNsMMqblXkjCyCxYcMmPVAsRtMsMTASXbhLN6U_YylRe__2bZw7MKotfghVtfxfHNERoIulwrb1TdMV4cp-jNjxsZ88K-OuLdokxiM'),
              }).subscribe();
            });
        });
      });

  }

}