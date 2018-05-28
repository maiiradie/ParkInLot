import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';

import 'rxjs/add/operator/take';
/**
 * Generated class for the CoCarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-co-car',
  templateUrl: 'co-car.html',
})
export class CoCarPage {
  userData;
  imgName;
  userId = this.authProvider.userId;

  constructor(private afdb:AngularFireDatabase, private afs:AngularFireAuth, private authProvider:AuthProvider, public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() {
      this.afdb.object(`profile/` + this.userId).valueChanges().take(1).subscribe(data => {
        this.userData = data;
        this.retrieveImg();
      });
  }

  retrieveImg() {
    firebase.storage().ref().child("images/" + this.userId + "/" + this.userData.carPic).getDownloadURL().then(d => {
      this.imgName = d;
    }).catch((error) => {
      alert(JSON.stringify(error));
    });
  }

}
