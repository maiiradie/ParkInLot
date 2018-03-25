import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';

import { Transaction } from '../../models/transac/transaction.interface';
import { CoUser } from '../../models/co/co-user.interface';
import { HoUser } from '../../models/ho/ho-user.interface';
import { User } from '../../models/user/user.interface';

/**
 * Generated class for the HoHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ho-home',
  templateUrl: 'ho-home.html',
})
export class HoHomePage {

  carStatus: string = "Parked";
  isAndroid: boolean = false;
  
  carStatuses = ['Arriving', 'Parked'];




  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform) {
    this.isAndroid = platform.is('android');
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad HoHomePage');
  }

}
