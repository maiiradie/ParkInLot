import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ComoredetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-comoredetails',
  templateUrl: 'comoredetails.html',
})
export class ComoredetailsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.navParams.get("tmp");
    console.log(this.navParams.get("tmp"));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComoredetailsPage');
  }

}
