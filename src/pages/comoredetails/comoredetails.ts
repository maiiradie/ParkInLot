import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';

import { RequestProvider } from '../../providers/request/request';

@IonicPage()
@Component({
  selector: 'page-comoredetails',
  templateUrl: 'comoredetails.html',
})

export class ComoredetailsPage {

    hoID;
    profileData:any;

  constructor(private requestProvider:RequestProvider, private afdb:AngularFireDatabase,public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() { 
    this.hoID = this.navParams.get('key');
    this.displayInfo();
  }

  displayInfo(){
    this.afdb.object('profile/'+ this.hoID).snapshotChanges().subscribe( data => {
      this.profileData = data.payload.val();
    });
  }

  sendRequest(HoToken){
    let coID = this.requestProvider.setID();   
    this.requestProvider.sendRequest(HoToken, coID, this.hoID);
  }

}
