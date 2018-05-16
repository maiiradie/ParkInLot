import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FCM } from '@ionic-native/fcm';
import { RequestProvider } from '../../providers/request/request';
import * as firebase from 'firebase/app';

@IonicPage()
@Component({
  selector: 'page-comoredetails',
  templateUrl: 'comoredetails.html',
})

export class ComoredetailsPage {
  reqFlag: Boolean = false;
  timeoutFlag: Boolean = false;
  actrlFlag: Boolean = false;
  hoID;
  profileData:any;
  userData:any;
  imgName;
  hown: boolean = true;
  cancel
  myTimeout;
  returnStatus;
  
  private key = "key=AAAAQHrZv6o:APA91bFLp4qD4gS00FAYrzzJiCoLwTBm-B9vadJNsMMqblXkjCyCxYcMmPVAsRtMsMTASXbhLN6U_YylRe__2bZw7MKotfghVtfxfHNERoIulwrb1TdMV4cp-jNjxsZ88K-OuLdokxiM";
  constructor(private requestProvider:RequestProvider, 
              private afdb:AngularFireDatabase,
              public navCtrl: NavController, 
              public navParams: NavParams,
              public toastCtrl: ToastController,
              private fcm: FCM, 
              public http: HttpClient, 
              public alertCtrl: AlertController
            ) {
  }
  
  ionViewDidLoad() { 
    this.hoID = this.navParams.get('key');
    this.displayInfo();
    this.retrieveImg();
  }
  ionViewDidLeave(){
    this.returnStatus.unsubscribe();    
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
    this.afdb.object<any>('requests/' + this.hoID).valueChanges().take(1).subscribe(data => {
      if (data.reqStatus == 'occupied' || data.reqStatus == 'accepted') {
        alert('The homeowner is on an ongoin transaction at the moment');
      } 
      else {
        this.showConfirm();
        
        this.afdb.object('requests/' + this.hoID).set({
          coID: coID,
          status: "ongoing",
          reqStatus: "occupied"
        });
        
        let body = {
          "notification": {
            "title": "You have a parking request!",
            "body": "",
            "sound": "default",
            "click_action": "FCM_PLUGIN_ACTIVITY",
            "icon": "fcm_push_icon"
          },
          "data": {
            "coID": coID,
            "hoToken": HoToken,
            "hoID": this.hoID
          },
          "to": HoToken,
          "priority": "high",
          "restricted_package_name": ""
        };
        let options = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.post("https://fcm.googleapis.com/fcm/send", body, {
          headers: options.set('Authorization', this.key),
        }).subscribe();
        
      }
      
    });
    
    //this.requestProvider.sendRequest(HoToken,coID, this.hoID);

  }

  retrieveImg() {
      firebase.storage().ref().child("images/" + this.hoID + "/" + this.profileData.garagePic).getDownloadURL().then(d=>{
        this.imgName = d;
      }).catch((error)=>{
        alert(JSON.stringify(error));
      });  
  }
  //function listener for accept decline 
  statusListener(){
    this.returnStatus = this.afdb.object<any>("requests/" + this.hoID).valueChanges().subscribe(data=>{        
      if(data.reqStatus == "declined"){
        clearTimeout(this.myTimeout);
        if(this.actrlFlag){
          this.cancel.dismiss();
          this.actrlFlag = false;
        }
        
          let alert = this.alertCtrl.create({
            title: 'Request',
            subTitle: 'Request has been ' + data.reqStatus,
            buttons: [
              {
              text: 'Ok',
              handler: () => {
                  this.reqFlag = false;
              }
            }
          ]
          });
          if(!this.reqFlag){
            alert.present();   
            this.reqFlag = true 
          }                 
          this.returnStatus.unsubscribe();    

      }else if (data.reqStatus == "accepted"){
        clearTimeout(this.myTimeout);
        if(this.actrlFlag){
          this.cancel.dismiss();
          this.actrlFlag = false;

          let alert = this.alertCtrl.create({
            title: 'Request',
            subTitle: 'Request has been ' + data.reqStatus,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  //put code here redirecting to cohome passing parameters of the homeowner
                  this.navCtrl.setRoot("CoHomePage", { key: this.hoID });
                }
              }
            ]
          });
          alert.present();
          this.returnStatus.unsubscribe();  
        }
      }
    });
  } 
//actioncontroller
  showConfirm() {
    this.cancel= this.alertCtrl.create({
      title: 'Request',
      message: 'Requesting...',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            clearTimeout(this.myTimeout);
            this.afdb.object("requests/" +this.hoID).update({
              coID: "",
              reqStatus: "",
              status:""
            });
            this.returnStatus.unsubscribe();
            if(this.actrlFlag){
              this.actrlFlag = false;
            }       
          }
        },
      ]
    });
    if(!this.actrlFlag){
      this.cancel.present();
      this.actrlFlag = true;
    }  
    this.setTimeout();
    this.statusListener();
  }
   setTimeout(){
    this.myTimeout = setTimeout(()=>{ 
      if(this.actrlFlag){
        this.cancel.dismiss();
        this.actrlFlag = false;
      }       
      this.afdb.object("requests/" +this.hoID).set({
        coID: "",
        reqStatus: "",
        status:""
      });
      let alert = this.alertCtrl.create({
        title: 'Request',
        subTitle: 'Request Timeout',
        buttons: [          
          {
          text: 'Ok',
          handler: () => {
          this.timeoutFlag = false;
        }
      }
        ]
      });
      if(!this.timeoutFlag){
        alert.present();
        this.timeoutFlag = true;
      }
      
      this.returnStatus.unsubscribe();
     }, 5000);  
  }
}
