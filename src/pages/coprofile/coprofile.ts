import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';
import 'rxjs/add/operator/take';

@IonicPage()
@Component({
  selector: 'page-coprofile',
  templateUrl: 'coprofile.html',
})
export class CoprofilePage {
	profileData:any;
  imgName;
	userId = this.authProvider.userId;


  constructor(public navCtrl: NavController, 
  				public navParams: NavParams, 
  				private afdb:AngularFireDatabase,
  				private authProvider: AuthProvider) {
  }

  ionViewDidLoad() {
		this.afdb.object(`profile/` + this.userId).valueChanges().take(1).subscribe( data => {
			this.profileData = data;
			this.retrieveImg();
		});
  }

  retrieveImg() {
	    firebase.storage().ref().child("images/" + this.userId + "/" + this.profileData.profPic).getDownloadURL().then(d => {
	      this.imgName = d;
	    }).catch((error) => {
				this.imgName = "./assets/imgs/avatar.jpg";
	    });
 	}

 editProfile(){
 	this.navCtrl.push("CoEditProfilePage");
 }

}
