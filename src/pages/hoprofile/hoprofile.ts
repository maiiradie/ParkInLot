import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';
import 'rxjs/add/operator/take';

@IonicPage()
@Component({
  selector: 'page-hoprofile',
  templateUrl: 'hoprofile.html',
})
export class HoprofilePage {
  profileData;
  imgName;
  userId;

  constructor(private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    private authProvider: AuthProvider,
    public navCtrl: NavController, 
    public navParams: NavParams) {
    this.userId = this.authProvider.userId;
  }

  ionViewDidLoad() {
    this.afdb.object(`/profile/` + this.userId).valueChanges().take(1).subscribe(data => {
      this.profileData = data;
      this.retrieveImg();
    });
  }

  retrieveImg(){
    firebase.storage().ref().child("images/" + this.userId + "/" + this.profileData.profPic).getDownloadURL().then(d => {
      this.imgName = d;
    }).catch((e) => {
      this.imgName = "./assets/imgs/avatar.jpg";
    }); 
  }

  editProfile() {
    this.navCtrl.push("HoEditProfilePage");
  }
}