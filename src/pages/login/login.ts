import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

// import { RegisterPage } from '../register/register';

import { RegisterPage } from '../register/register';

import { AuthProvider } from '../../providers/auth/auth';

import { Profile } from '../../models/profile';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  login = {} as Profile;

  constructor(public authProvider:AuthProvider, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  onSignin(){
   this.authProvider.loginUser(this.login)
   .then(() => {
      this.authProvider.setID();
      if (this.authProvider.setID().length != 0) {
        //  this.authProvider.getUser()
        //  .subscribe(role => {
        //    if (role.carowner) {
        //      this.navCtrl.setRoot("CoHomePage");
        //    }else{
        //      this.navCtrl.setRoot("HoHomePage");
        //    }
        //  });
        this.navCtrl.setRoot("MenuPage");
      }

   })
   //catch blank input/ custom catch error
   .catch(err => console.log(err.message));
  }
  
  register(){
  	this.navCtrl.push("RegisterPage");
  }  
}
