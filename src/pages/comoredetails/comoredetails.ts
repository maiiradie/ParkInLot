import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { HttpClient } from '@angular/common/http';
import { AuthProvider } from '../../providers/auth/auth';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-comoredetails',
  templateUrl: 'comoredetails.html',
})

export class ComoredetailsPage {
  myData:any;
  myCar: any;
  tempKey;
  reqButton:Boolean = true;
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
  garrageDet;
  _returnStatus;
  _homeownerStatus;
  garrageDetTwo;

  
  private key = "key=AAAAQHrZv6o:APA91bFLp4qD4gS00FAYrzzJiCoLwTBm-B9vadJNsMMqblXkjCyCxYcMmPVAsRtMsMTASXbhLN6U_YylRe__2bZw7MKotfghVtfxfHNERoIulwrb1TdMV4cp-jNjxsZ88K-OuLdokxiM";
  constructor(
              private afs: AngularFireAuth,
              private authProvider:AuthProvider,
              private afdb:AngularFireDatabase,
              public navCtrl: NavController, 
              public navParams: NavParams,
              public toastCtrl: ToastController,
 
              public http: HttpClient, 
              public alertCtrl: AlertController
            ) {
  }
  
  ionViewDidLoad() { 
    this.hoID = this.navParams.get('key');
    this.getGarrageData();
    this.getMyData();

    
    this.displayInfo();
    
  }
  ionViewDidEnter(){
    this.retrieveImg();
  }
  ionViewDidLeave(){ 
    if(this._homeownerStatus){
      this._homeownerStatus.unsubscribe();
    }
    if(this._returnStatus){
      this._returnStatus.unsubscribe();
    }

  }
  isTransacting(){ 
      this.afdb.object('profile/' + this.afs.auth.currentUser.uid).update({
        isTransacting: true,
    });

    
    
  }
  isNotTransacting(){
    this.afdb.object('profile/' + this.afs.auth.currentUser.uid).update({
      isTransacting: false
    });
  }
  getMyData(){
    this.afdb.object('profile/'+ this.authProvider.userId).valueChanges().take(1).subscribe( data => {
      this.myData = data;
    });
    this.afdb.list<any>('profile/' + this.afs.auth.currentUser.uid + '/cars').valueChanges().take(1).subscribe(plate=>{
      for(let i = 0; i < plate.length; i ++){
        if(plate[i].isActive == true){
          this.myCar = plate[i];
        }
      }
    });
  }
  getGarrageData(){    
    this.afdb.object('requests/'+ this.hoID).valueChanges().take(1).subscribe( data => {
      this.garrageDet = data
    });
    this.afdb.object('location/'+ this.hoID).valueChanges().take(1).subscribe( data => {
      this.garrageDetTwo = data
    });
  }

  displayInfo(){
    
    this.afdb.object('profile/'+ this.hoID).snapshotChanges().take(1).subscribe( data => {
      this.profileData = data.payload.val();
      
      if(this.profileData.establishment == true) {
        this.hown = false;
        this.profileData.openingTime = this.tConvert(this.profileData.openingTime);
        this.profileData.closingTime = this.tConvert(this.profileData.closingTime);
      }
    });
    this.afdb.object('location/'+ this.hoID).snapshotChanges().take(1).subscribe( data => {
      this.userData = data.payload.val();
    });

  }

  tConvert(time) {
      let hour = (time.split(':'))[0]
      let min = (time.split(':'))[1]
      let part = hour > 12 ? 'PM' : 'AM';

      min = (min + '').length == 1 ? `0${min}` : min;
      hour = hour > 12 ? hour - 12 : hour;
      hour = (hour + '').length == 1 ? `0${hour}` : hour;

      return (`${hour}:${min} ${part}`);
  }

  sendRequest(HoToken){
    this.reqButton = false;
    let coID = this.authProvider.userId;   
    this._homeownerStatus = this.afdb.object<any>('location/' + this.hoID).valueChanges().take(1).subscribe(locData=>{
      let temp = this.afdb.object<any>('requests/' + this.hoID ).valueChanges().subscribe(data => {
        if (data.available == 0) {
          this.reqButton = true;
          let alert1 = this.alertCtrl.create({
            title: 'No space available',
            buttons: ['Dismiss']
          });
          alert1.present();
          temp.unsubscribe();
        } else if(locData.status === "offline"){
          let alert2 = this.alertCtrl.create({
            title: 'Homeowner is Offline',
            buttons: ['Dismiss']
          });
          alert2.present();
          this.reqButton = true;
          temp.unsubscribe();
        }else {
          this.isTransacting();
          this.statusListener();
          var tempCap = data.available;
          temp.unsubscribe();
          for(var i = 0; i < data.capacity; i++){
              var pic = this.imgName;
              var name = this.myData.fname + ' ' + this.myData.lname
              var plateNumber = this.myCar.plateNumber;
              this.afdb.list("requests/" + this.hoID + '/requestNode').push({    
                coID,              
                name,
                plateNumber,
                status:"pending"
              }); 
              tempCap --;            
              this.showConfirm(i)
              this.afdb.object('requests/' + this.hoID ).update({
                available: tempCap
              }); 
              
              break;
          }        
          
        }
        
      });
    });
  

  }

  async retrieveImg() {
      await firebase.storage().ref().child("images/" + this.hoID + "/" + this.profileData.garagePic).getDownloadURL().then(d=>{
        this.imgName = d;
      }).catch((error)=>{
        // alert(JSON.stringify(error));
        this.imgName = null;
      });  
  }
  //function listener for accept decline 
  async statusListener(){
      this._returnStatus = await this.afdb.list<any>('requests/' + this.hoID + '/requestNode',ref => ref.orderByChild('coID').equalTo(this.authProvider.userId)).snapshotChanges().take(2).subscribe(data=>{
        
        for(var i = 0; i < data.length; i++){    
                
          if(data[i].payload.val().status == "declined"){
            this.isNotTransacting();
            this._returnStatus.unsubscribe();            
            clearTimeout(this.myTimeout);
            if(this.actrlFlag){
              this.cancel.dismiss();
              this.actrlFlag = false;
            }
            
            this.reqButton = true;
            let alert = this.alertCtrl.create({
              title: 'Request',
              subTitle: 'Request has been declined' ,
              buttons: [
                {
                text: 'Ok',
                handler: () => {
                }
              }
            ]
            });
            alert.present();
            var tempCap;
            //returning capacity
            let temp = this.afdb.object<any>('requests/' + this.hoID ).valueChanges().subscribe(data=>{        
            tempCap = data.available
            temp.unsubscribe();
            tempCap ++;        
            this.afdb.object('requests/' + this.hoID ).update({
              available: tempCap  
              }); 
            });
          }else if(data[i].payload.val().status == "accepted"){
            this._returnStatus.unsubscribe();            
            clearTimeout(this.myTimeout);
            if(this.actrlFlag){
              this.cancel.dismiss();
              this.actrlFlag = false;
            }
            
            this.reqButton = true;
            let alert = this.alertCtrl.create({
              title: 'Request',
              subTitle: 'Request has been accepted!' ,
              enableBackdropDismiss: false	,
              buttons: [
                {
                text: 'Continue',
                handler: () => {
                  this.navCtrl.setRoot("CoHomePage", 
                  { 
                    hoID: this.hoID,
                  }
                  );                      
                }
              }
            ]
            });
            alert.present();

          }
       }
    });
  }

  showConfirm(i) {
    var tempCap;
    this.cancel= this.alertCtrl.create({
      title: 'Request',
      message: 'Requesting...',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            this.reqButton = true;
            clearTimeout(this.myTimeout);
            this.isNotTransacting();

            let tempo = this.afdb.list('requests/' + this.hoID + '/requestNode/').snapshotChanges().subscribe(data=>{
              tempo.unsubscribe();
              for(var i = 0; i < data.length;i ++){
                if(data[i].payload.val().coID == this.authProvider.userId){
                  this.afdb.list('requests/' + this.hoID + '/requestNode/').remove(data[i].key);
                }
              }
            });

            let temp = this.afdb.object<any>('requests/' + this.hoID).valueChanges().subscribe(data => {
                tempCap = data.available
                temp.unsubscribe();
                tempCap++;
                this.afdb.object('requests/' + this.hoID).update({	
                    available: tempCap
                });
            });
  
            this._returnStatus.unsubscribe();
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
    this.setTimeout(i);
    this.statusListener();
  }

  setTimeout(i){
    var tempCap;
       this.myTimeout = setTimeout(() => {
            this.isNotTransacting();
            this._returnStatus.unsubscribe();
            this.reqButton = true;
            if (this.actrlFlag) {
                this.cancel.dismiss();
                this.actrlFlag = false;
            }

            let tempo = this.afdb.list('requests/' + this.hoID + '/requestNode/').snapshotChanges().subscribe(data => {
                tempo.unsubscribe();
                for (var i = 0; i < data.length; i++) {
                   if (data[i].payload.val().coID == this.authProvider.userId) {
                       this.afdb.list('requests/' + this.hoID + '/requestNode/').remove(data[i].key);
                      }
                  }
              });
      
              let temp = this.afdb.object<any>('requests/' + this.hoID).valueChanges().subscribe(data => {
                  tempCap = data.available
                  temp.unsubscribe();
                  tempCap++;
                  this.afdb.object('requests/' + this.hoID).update({	
                      available: tempCap
                  });
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
      if (!this.timeoutFlag) {
        alert.present();
        this.timeoutFlag = true;
      }

      this._returnStatus.unsubscribe();
     }, 60000);  
  }
  
}
