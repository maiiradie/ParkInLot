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
  timeData: any;
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

  ionViewDidEnter() {
    this.afdb.object<any>('profile/' + this.userId).snapshotChanges().subscribe(data => {
      this.timeData = data;
    });

    this.afdb.object<any>('establishments/'+ this.userId ).snapshotChanges().subscribe( data => {
      this.profileData = data;
      this.myStatus = data.payload.val().status;
        
      if(this.checkTime()) {
        if (data.payload.val().status == 'online') {
          this.toggleValue = true;
          this.updateStat();
        } else {
          this.toggleValue = false;
          this.updateStat();
        }
      } else {
        this.OnOff = 'Closed'
        this.afdb.object('establishments/' + this.userId).update({status: "offline"});
      }

      this.updateTime();
    });
  }

updateTime() {
  setInterval(() => {
    if(!this.checkTime()) {
      this.OnOff = 'Closed'
      this.afdb.object('establishments/' + this.userId).update({status: "offline"});
    } 
  }, 60000);
}

updateStat(){
  if(this.toggleValue){
  	this.OnOff = 'Available';
    this.afdb.object('establishments/' + this.userId).update({status: "online"}).then( () => {
      this.afdb.object('profile/'+ this.userId).update({availability:true});
    });
  }else{
  	this.OnOff = 'Full'
    this.afdb.object('establishments/' + this.userId).update({status: "offline"}).then( () => {
      this.afdb.object('profile/' + this.userId).update({ availability: false });
    });
  }   
}

checkTime() {
  var result = false;
  var today = new Date();
  var todayH = today.getHours();
  var todayM = today.getMinutes();

  var openH = parseInt(this.timeData.payload.val().openingTime.substring(0, this.timeData.payload.val().openingTime.indexOf(':')));
  var openM = parseInt(this.timeData.payload.val().openingTime.substring(this.timeData.payload.val().openingTime.indexOf(':')+1));
  var closeH = parseInt(this.timeData.payload.val().closingTime.substring(0, this.timeData.payload.val().closingTime.indexOf(':')));
  var closeM = parseInt(this.timeData.payload.val().closingTime.substring(this.timeData.payload.val().closingTime.indexOf(':')+1));

  if ((todayH > openH && todayH < closeH) || ((todayH == openH) && (todayM >= openM)) || ((todayH == closeH) && (todayM <= closeM))) {
    result = true;
  } 
  return result;
}

	openEstbProfile(){
	  this.navCtrl.push('EstProfilePage');
	}

  logout() {
    //clear any cached data
    this.authProvider.logoutUser();
    // .then( () => {
    this.navCtrl.setRoot('LoginPage');
    // });
  }

}
