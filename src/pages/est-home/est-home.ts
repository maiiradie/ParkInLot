import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController} from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-est-home',
  templateUrl: 'est-home.html',
})
export class EstHomePage {
  status
  profileData:any;
  myStatus: boolean;
  toggleValue:boolean;
  OnOff: string;
  userId = this.authProvider.userId;

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController, 
    private app:App,
    public navParams: NavParams,
    public afdb: AngularFireDatabase, 
    private afs:AngularFireAuth, 
    private authProvider: AuthProvider) {

  }

  ionViewDidLoad() {
      this.afdb.object<any>('location/'+ this.userId ).snapshotChanges().subscribe( data => {
        this.profileData = data;
        this.myStatus = data.payload.val().status;
       	
       	if (data.payload.val().status == 'online') {
		  	this.toggleValue = true;
		  	this.updateStat();
       	}else{
       		this.toggleValue = false;
       		this.updateStat();
       	}
      });

}

updateStat(){
  if(this.toggleValue){
  	this.OnOff = 'Available';
    this.afdb.object('location/' + this.userId).update({status: "online"});
  }else{
  	this.OnOff = 'Full'
    this.afdb.object('location/' + this.userId).update({status: "offline"});
  }   
}

	openEstbProfile(){
	  this.navCtrl.push('EstProfilePage');
	}

  logout() {
    //clear any cached data
    this.authProvider.logoutUser()
    // .then( () => {
    this.navCtrl.setRoot('LoginPage');
    // });
  }

}
