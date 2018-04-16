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
  selector: 'page-hoprofile',
  templateUrl: 'hoprofile.html',
})
export class HoprofilePage {
  profileData:any;
  public imgName;
  private userId;

  constructor(private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    private authProvider: AuthProvider,
    public navCtrl: NavController, 
    public navParams: NavParams) {
  }

  ionViewWillEnter() {
    this.userId = this.authProvider.setID();

    this.afdb.object(`/profile/` + this.userId).valueChanges().subscribe(data => {
      this.profileData = data;
      firebase.storage().ref().child("images/" + this.userId + "/" + this.profileData.profPic).getDownloadURL().then(d=>{
        this.imgName = d;
      }).catch((e)=>{
        this.imgName = "./assets/imgs/avatar.jpg";
      }) 
    });
  }

  ionViewDidLoad() {
    console.log("This is Ho profile page");
  }

  editProfile() {
    this.navCtrl.push("HoEditProfilePage");
  }
}