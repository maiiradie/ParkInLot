import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';

import 'rxjs/add/operator/take';

/**
 * Generated class for the HoprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ho-garage',
  templateUrl: 'ho-garage.html',
})
export class HoGaragePage {
  userData:any;
  public imgName;
  private userId;

  constructor(private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    private authProvider: AuthProvider,
    public navCtrl: NavController, 
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.afs.authState.take(1).subscribe( auth => {
      this.afdb.object(`/profile/${auth.uid}`).valueChanges().subscribe( data => {
        this.userData = data;
        this.retrieveImg();
      });
    });
  }

  editGarage() {
    this.navCtrl.push("HoEditGaragePage");
  }

  retrieveImg() {
    this.userId = this.authProvider.setID();
      firebase.storage().ref().child("images/" + this.userId + "/" + this.userData.garagePic).getDownloadURL().then(d=>{
        this.imgName = d;
      }).catch((error)=>{
        alert(JSON.stringify(error));
      })  
  }

}
