import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CoregisterPage } from '../coregister/coregister';
import { HoregisterPage } from '../horegister/horegister';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  coregister(){
     this.navCtrl.push(CoregisterPage);
  }
  horegister(){
    this.navCtrl.push(HoregisterPage);
  }
}
