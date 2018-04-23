import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';

import { RequestProvider } from '../../providers/request/request';
import * as firebase from 'firebase/app';

@IonicPage()
@Component({
  selector: 'page-comoredetails',
  templateUrl: 'comoredetails.html',
})

export class ComoredetailsPage {
  hoID;
  profileData:any;
  userData:any;
  imgName;
  hown: boolean = true;
  
  constructor(private requestProvider:RequestProvider, private afdb:AngularFireDatabase,public navCtrl: NavController, public navParams: NavParams) {
  }
  
  ionViewDidLoad() { 
    this.hoID = this.navParams.get('key');
    this.displayInfo();
    this.retrieveImg();
  }
  
  displayInfo(){
    
    this.afdb.object('profile/'+ this.hoID).snapshotChanges().take(1).subscribe( data => {
      this.profileData = data.payload.val();
      if(this.profileData.establishment == true) {
        this.hown = false;
      }
    });
    this.afdb.object('location/'+ this.hoID).snapshotChanges().take(1).subscribe( data => {
      this.userData = data.payload.val();
    });

  }

  sendRequest(HoToken){
    let coID = this.requestProvider.setID();   
    this.requestProvider.sendRequest(HoToken, coID, this.hoID);

  }

  retrieveImg() {
      firebase.storage().ref().child("images/" + this.hoID + "/" + this.profileData.garagePic).getDownloadURL().then(d=>{
        this.imgName = d;
      }).catch((error)=>{
        alert(JSON.stringify(error));
      });  
  }
}