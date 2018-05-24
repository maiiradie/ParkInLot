import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';

@Injectable()
export class AuthProvider {

  //Logged in user ID
  userId: any;

  constructor(private geolocation: Geolocation, public http: HttpClient, private afs: AngularFireAuth, private afdb: AngularFireDatabase) {
  }

  //run onlogin
  setID() {
    return this.userId = this.afs.auth.currentUser.uid;
  }

  getUser() {
    return this.afdb.object<any>('profile/' + this.userId).valueChanges().take(1);
  }

  updateOnDisconnect() {
    firebase.database().ref().child('profile/' + this.userId)
      .onDisconnect()
      .update({ status: 'offline' });
  }
  
  updateHOOnDisconnect() {
    firebase.database().ref().child('location/' + this.userId)
      .onDisconnect()
      .update({ status: 'offline' });
  }

  updateStatus(status) {
    return this.afdb.object('profile/' + this.userId)
      .update({ 
        status: status
      });
  }

  updateHOStatus(status) {
    return this.afdb.object('location/' + this.userId)
      .update({
        status: status
      });
  }

  loginUser(login) {
    return this.afs.auth.signInWithEmailAndPassword(login.email, login.password);
  }

  logoutUser() {
    return this.updateStatus('offline').then( () => {
        this.afs.auth.signOut();
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
           status:'offline',
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
