import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';

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
    public profileData:any;

  constructor(private afdb:AngularFireDatabase,public navCtrl: NavController, public navParams: NavParams) {
    this.id = this.navParams.get('key');
    this.displayInfo();
  }

  ionViewDidLoad() { 
  }

  displayInfo(){
    this.afdb.object('profile/'+ this.id).valueChanges().subscribe( data => {
      this.profileData = data;
    });
  }

  sendRequest(){
    this.afdb.list('request').push({
      homeowner:'eli shabo',
      carowner:'eli shabo parin carowner',
      created_at: Date.now()
    });
  }

}
