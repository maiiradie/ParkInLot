import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

// import { AuthProvider } from '../../providers/auth/auth'; 

@IonicPage()
@Component({
  selector: 'page-homeho',
  templateUrl: 'homeho.html',
})
export class HomehoPage {
 
  //private authProvider:AuthProvider,
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {    
  }
}
