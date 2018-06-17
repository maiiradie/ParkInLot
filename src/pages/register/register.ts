import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  coregister(){
     this.navCtrl.push("CoregisterPage");
  }
  horegister(){
    this.navCtrl.push("HoregisterPage");
  }
}
