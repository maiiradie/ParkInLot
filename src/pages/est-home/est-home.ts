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
        
        if(this.myStatus == true){
          this.OnOff = 'Available';
        }else{
          this.OnOff = 'Full'
          
        }
      });

}

updateStat(){
  if(this.toggleValue){
    this.afdb.object('location/' + this.userId).update({status: "online"});
  }else{
    this.afdb.object('location/' + this.userId).update({status: "offline"});
  }
    

    
}

openEstbProfile(){
  this.navCtrl.push('EstProfilePage');
}

// logout(){
// //clear any cached data
//   this.authProvider.logoutUser().then( () => {
//     this.navCtrl.setRoot('LoginPage');
//   });
// }

  logout() {
    //clear any cached data
    this.authProvider.logoutUser()
    // .then( () => {
    this.navCtrl.setRoot('LoginPage');
    // });
  }

}
