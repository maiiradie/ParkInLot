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

    public id;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.id = this.navParams.get('key');
  }

  ionViewDidLoad() {
    console.log(this.id);
  }

}
