import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import 'rxjs/add/operator/take';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

	profileData:any;


  constructor(private afdb:AngularFireDatabase,private afs:AngularFireAuth,
    public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
	this.afs.authState.take(1).subscribe( auth => {
		this.afdb.object(`/profile/${auth.uid}`).valueChanges().subscribe( data => {
			this.profileData = data;
		});
	});

  }
  	
}
