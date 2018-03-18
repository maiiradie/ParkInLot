import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';

@IonicPage()
@Component({
  selector: 'page-comoredetails',
  templateUrl: 'comoredetails.html',
})

export class ComoredetailsPage {

    id;
    profileData:any;

  constructor(private afdb:AngularFireDatabase,public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() { 
    this.id = this.navParams.get('key');
    this.displayInfo();
  }

  displayInfo(){
    this.afdb.object('profile/'+ this.id).valueChanges().subscribe( data => {
      this.profileData = data;
    });
  }

  sendRequest(){
    // this.afdb.list('request').push({
    //   homeowner:this.id,
    //   carowner:'carowner iD',
    //   created_at: Date.now()
    // });
  }

}
