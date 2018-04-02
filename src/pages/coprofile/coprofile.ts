import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';

import 'rxjs/add/operator/take';

/**
 * Generated class for the CoprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-coprofile',
  templateUrl: 'coprofile.html',
})
export class CoprofilePage {
	profileData:any;
  	public imgName;
  	private userId;

  constructor(public navCtrl: NavController, 
  				public navParams: NavParams, 
  				private afdb:AngularFireDatabase,
  				private afs: AngularFireAuth,
  				private authProvider: AuthProvider) {
  }

  ionViewDidLoad() {
    this.afs.authState.take(1).subscribe( auth => {
	      this.afdb.object(`/profile/${auth.uid}`).valueChanges().subscribe( data => {
	        this.profileData = data;
	        this.retrieveImg();
	      });
	    });
  }

  retrieveImg() {
	this.userId = this.authProvider.setID();
	    firebase.storage().ref().child("images/" + this.userId + "/" + this.profileData.profPic).getDownloadURL().then(d => {
	      this.imgName = d;
	      console.log(this.imgName);
	    }).catch((error) => {
				this.imgName = "./assets/imgs/avatar.jpg";
	    })
 	}

 editProfile(){
 	this.navCtrl.push("CoEditProfilePage");
 }

}
