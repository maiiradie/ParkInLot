import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/operator/take';
import { AuthProvider } from '../../providers/auth/auth';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-est-profile',
  templateUrl: 'est-profile.html',
})
export class EstProfilePage {


  profileData:any;
  userId = this.authProvider.userId;

  constructor(private afdb:AngularFireDatabase,
    public navCtrl: NavController,
    public navParams: NavParams,
    public authProvider:AuthProvider) {
  }

  ionViewDidEnter() {
    this.afdb.object('profile/'+ this.userId).valueChanges().take(1).subscribe( data => {
      this.profileData = data;
      this.profileData.openingTime = moment(this.profileData.openingTime, ["h:mm"]).format("hh:mm a");
      this.profileData.closingTime = moment(this.profileData.closingTime, ["h:mm"]).format("hh:mm a");
    });
  }

  openEditProfile(){
     this.navCtrl.push('EstEditProfilePage');
  }

}
