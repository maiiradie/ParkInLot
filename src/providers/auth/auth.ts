import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';

@Injectable()
export class AuthProvider {

  //Current ID
  userId: any;

  constructor(private geolocation: Geolocation, public http: HttpClient, private afs: AngularFireAuth, private afdb: AngularFireDatabase) {
    this.afs.auth.onAuthStateChanged(user => {
      if (user) {
        this.updateOnConnect();
        this.updateOnDisconnect();
      } else {
        //debug
        console.log('currently logged out');
      }
    });

    this.afdb.list('/location');
  }

  setID() {
    return this.userId = this.afs.auth.currentUser.uid;
  }

  getUser() {
    return this.afdb.object<any>('profile/' + this.userId).valueChanges();
  }

  updateOnDisconnect() {
    firebase.database().ref().child('profile/' + this.userId)
      .onDisconnect()
      .update({ status: 'offline' })
  }

  updateOnConnect() {
    return this.afdb.object('.info/connected').valueChanges()
      .subscribe(connected => {
        if (connected) {
          status = 'online';
          this.updateStatus(status);
        }
      });
  }
  //Status helper
  updateStatus(status) {
    return this.afdb.object('profile/' + this.userId)
      .update({ status: status });
  }

  //location helper / for markers
  getHO() {
  }

  loginUser(login) {
    return this.afs.auth.signInWithEmailAndPassword(login.email, login.password);
  }

  logoutUser() {
    return this.afs.auth.signOut()
      .then(() => {
        this.updateStatus('offline');
      });
  }

  registerCarOwner(uForm, cForm, img){
    return this.afs.auth.createUserWithEmailAndPassword(uForm.email,uForm.password)
     .then((user) => {
        this.afdb.object(`profile/${user.uid}`).set({
           fname:uForm.fname,
           lname:uForm.lname,
           email:uForm.email,
           mobile:uForm.mobile,
           carowner:true,
           plateNumber:cForm.plateno,
           carmodel:cForm.carmodel,
           carPic:img,
           profPic:null,
           reg_status:"pending",
           created_at:Date.now()
        });
     })
   }
 

  locateHO() {
    let options = {
      timeout: 10000,
      enableHighAccuracy: true
    };

    let locationsObs = Observable.create(observable => {
      this.geolocation.getCurrentPosition(options)
        .then(resp => {
          let lat = resp.coords.latitude;
          let lng = resp.coords.longitude;
          let location = { lat, lng };
          observable.next(location);
        }).catch(error => {
          console.log('Error getting location', error);
        });
    });
    return locationsObs;
  }

  registerHomeOwner(uForm, gForm, img, location) {
    return this.afs.auth.createUserWithEmailAndPassword(uForm.email, uForm.password)
      .then((user) => {
        this.afdb.object(`profile/${user.uid}`).set({
          fname: uForm.fname,
          lname: uForm.lname,
          email: uForm.email,
          mobile: uForm.mobile,
          // capacity: gForm.capacity,
          details: gForm.details,
          homeowner: true,
          garagePic: img,
          profPic: null,
          reg_status: "pending",
          created_at: Date.now()
        }).then( () => {
          this.afdb.object(`location/${user.uid}`).set({
            lat: location.lat,
            lng: location.lng,
            address: gForm.address,
          });
        });
      })
  }


}
