import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, MenuController, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

import { Transaction } from '../../models/transac/transaction.interface';
import { User } from '../../models/user/user.interface';
import { AuthProvider } from '../../providers/auth/auth';

import { RequestProvider } from '../../providers/request/request';
import { FCM } from '@ionic-native/fcm';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@IonicPage()
@Component({
  selector: 'page-ho-home',
  templateUrl: 'ho-home.html',
})
export class HoHomePage {
  role = "";
  parkedCarOwners = [];
  requestingCarOwners = [];
  arrivingCarOwners = [];
  slots = [];
  start;
  startTime:boolean = false;
  arriving: boolean = false;
  parked: boolean = false;
  unfiltered;
  filtered;
  myId = this.authProvider.userId;
  items: Array<any> = [];
  itemRef: firebase.database.Reference = firebase.database().ref('/transac');
  flagAlrtCtrl:boolean = false;
  userId= this.authProvider.userId;
  fname;
  lname;
  hoProfile;
  request;

  //for toggle of availability
  toggleValue = true;

  //button toggle for notification
  isEnabled:boolean = false;
  requestAlrtCtrl;

  constructor(private requestProvider: RequestProvider,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private fcm: FCM,
    public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private afdb: AngularFireDatabase,
    private authProvider: AuthProvider,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController) {

    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.authProvider.updateHOStatus('online');
        this.authProvider.updateHOOnDisconnect();
      }
    });

    //this.requestProvider.saveToken();
   // this.onNotification();
    menuCtrl.enable(true);
  }
  myVar = 'pic_angular.jpg'
  async retrieveImg(coID,coPic) {
    await firebase.storage().ref().child("images/" + coID+ "/" + coPic).getDownloadURL().then(d=>{
      return d;
    }).catch((error)=>{
      alert(JSON.stringify(error));
    });  
}

  ionViewDidLoad(){
    this.getTransactions();
    this.afdb.object('profile/' + this.userId).valueChanges().take(1)
      .subscribe(profileData => {
        this.hoProfile = profileData;
    });
  }

   ionViewWillEnter() {
    this.getRole();
  }

  getTransactions(){
    this.afdb.list('requests/' + this.userId + '/requestNode').snapshotChanges().subscribe(data=>{  
      this.requestingCarOwners = data;


    });    
    this.afdb.list('requests/' + this.userId + '/arrivingNode').snapshotChanges().subscribe(data=>{
      this.arrivingCarOwners = data;
    });
    this.afdb.list('requests/' + this.userId + '/parkedNode').snapshotChanges().subscribe(data=>{
      this.parkedCarOwners = data;
    });  
  }

  arrived(carowner,key){
    this.afdb.list('requests/' + this.userId + '/arrivingNode').update(key,{
      status: "transferred"
    });
    this.afdb.list('requests/' + this.userId + '/arrivingNode').remove(key);
    this.afdb.list('requests/' + this.userId + '/parkedNode').push({
      carowner:carowner,
      timeStart: "",
      endTime: "",
      payment: ""
    });

  }
  initCancelParked(carowner,key){
    let alert = this.alertCtrl.create({
      title: 'Cancel Transaction',
      subTitle: 'Do you want to cancel the transaction?',
      buttons: [
        {
          text: 'No',
          role: 'no',
          handler: () => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.afdb.list<any>('requests/' + this.userId + '/parkedNode').update(key,{
              status: 'cancelled'
            });
          }
        }
      ]
    });
    alert.present();
}
  initCancelArriving(carowner,key){
    let alert = this.alertCtrl.create({
      title: 'Cancel Transaction',
      subTitle: 'Do you want to cancel the transaction?',
      buttons: [
        {
          text: 'No',
          role: 'no',
          handler: () => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.afdb.list<any>('requests/' + this.userId + '/arrivingNode').update(key,{
              status: 'hoCancelled'
            });
          }
        }
      ]
    });
    alert.present();
}

  clearArriving(key){
    var tempCap;
    this.afdb.list('requests/' + this.userId + '/arrivingNode').remove(key);
          // tempCap  
      let temp = this.afdb.object<any>('requests/' + this.userId ).valueChanges().subscribe(data=>{        
        tempCap = data.available
        temp.unsubscribe();
        tempCap ++;        
        this.afdb.object('requests/' + this.userId ).update({
          available: tempCap
        }); 
      });
  }
  ngOnDestroy() {
    //this.request.unsubscribe();
  }

  //listens for incoming requests

declineRequest(id){
  this.afdb.list('requests/' + this.userId + '/requestNode').update(id,{status: "declined"});
  this.afdb.list('requests/' + this.userId + '/requestNode').remove(id);
}
async acceptRequest(carowner,id){
  var place = 0;
  //remove list in request
  this.afdb.list('requests/' + this.userId + '/requestNode').update(id,{status: "accepted"});
  this.afdb.list('requests/' + this.userId + '/requestNode').remove(id);
  this.afdb.list('requests/' + this.userId + '/arrivingNode').push({
    carowner,
    status: "arriving"
  });
}
  showNotif(){
    this.requestAlrtCtrl = this.alertCtrl.create({
      title: 'You have a parking space request',
      enableBackdropDismiss: false,
      buttons: [
        {
           text: 'Decline',
          handler: () => {
            this.afdb.object("requests/" +this.userId).set({
              coID: "",
              reqStatus: "declined",
              status:""
            });

            this.afdb.object("requests/" +this.userId).set({
              coID: "",
              reqStatus: "",
              status:""
            });
            this.flagAlrtCtrl = false;
          }
        },
        { 
        text: 'Accept',
           handler: () => {
             //check if data is not blank
             this.afdb.object<any>("requests/" + this.userId).valueChanges().take(1).subscribe(data=>{
               //if data is blank then notify that the request has timedout
              if(data.coID == "" && data.reqStatus == ""){
                let alertTimeout = this.alertCtrl.create({
                  title: 'Request has timed out',
                  buttons:['OK']                  
                });
              }else{
                this.afdb.object("requests/" +this.userId).update({
                  reqStatus: "accepted",
                  motionStatus: "arriving",
                  createdAt: Date.now()
                });
              }
             });
             this.arriving = true;              
             
             // else accept the request
            this.flagAlrtCtrl = false;
         }
        }
      ],
     });
     if(!this.flagAlrtCtrl){
      this.requestAlrtCtrl.present();
      this.flagAlrtCtrl = true;
     }
     
  }

  closeAlrtCtrlOnTimeout(){
    let temp = this.afdb.object<any>("requests/" + this.userId).valueChanges().subscribe(data=>{
      if(data.coID == "" && data.reqStatus == "" && data.status == ""){
        if(this.flagAlrtCtrl){
          this.requestAlrtCtrl.dismiss();
          this.flagAlrtCtrl = false;
          temp.unsubscribe();
        }
      }    
    });
  }

  async onNotification() {
    try {
      await this.platform.ready();

      this.fcm.onNotification().subscribe(data => {
        this.afdb.object<any>('profile/' + data.coID).valueChanges().take(1).subscribe(codata => {
          var fname, lname, platenumber;
          fname = codata.fname;
          lname = codata.lname;

          if (data.wasTapped) {
            //toast Controller
            let toast = this.toastCtrl.create({
              message: 'You have a parkint request from ' + fname + ' ' + lname,
              duration: 4000,
              position: 'top'
            });
            toast.present();
          } else {  
            //toast Controller
            let toast = this.toastCtrl.create({
              message: 'You have a parkint request from ' + fname + ' ' + lname,
              duration: 4000,
              position: 'top'
            });
            toast.present();
          }

        });

      });
    } catch (e) {
      console.log(e);
    }
  }

  openMenu(evt) {
    if (evt === "coho-Menu") {
      this.menuCtrl.enable(true, 'coho-Menu');
      this.menuCtrl.enable(false, 'Co-Menu');
      this.menuCtrl.enable(false, 'Ho-Menu');
    } else if (evt === "Ho-Menu") {
      this.menuCtrl.enable(true, 'Ho-Menu');
      this.menuCtrl.enable(false, 'Co-Menu');
      this.menuCtrl.enable(false, 'coho-Menu');
    }
    this.menuCtrl.toggle();
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'hey you just entered this',
      subTitle: 'Your email is already taken or used.',
      buttons: ['OK']
    });
    alert.present();
  }


  toParked() {
    this.afdb.object('requests/' + this.myId).update({
      motionStatus: "parked"
    });
    this.arriving = false;
    this.parked = true;
  }

  startTimer(carowner,key) {
    
    this.startTime = true;
    var startTemp = Date.now();
    var tempD = new Date(startTemp);
    this.start = tempD.toLocaleTimeString();
    this.afdb.list('requests/' + this.myId + '/parkedNode').update(key,{
      timeStart: startTemp,
      timeStartFormat: this.start
    });
  }
  stopTimer(carowner,key) {
    var tempCap;
    this.startTime
    //get stopTime
    var endDate = Date.now();
    var endDateH = new Date(endDate);
    var endHour = endDateH.getHours();
    var startDate;
    var computedHours;
    var payment;
    //query to database
    this.afdb.list('requests/' + this.myId + '/parkedNode').snapshotChanges().take(1).subscribe(data=>{
      
      for(var i = 0; i < data.length; i++){			
				if(data[i].payload.val().carowner.coID == carowner.payload.val().carowner.coID){	
          startDate = data[i].payload.val().timeStart;
          //to date of start date
          var startDateH = new Date(startDate);
          //get the hours of the start date
          var startHour = startDateH.getHours();
          //compute for time
          computedHours = endHour - startHour;``
          // start time minutes
          var startMin = startDateH.getMinutes();
          //end time minutes
          var endMin = endDateH.getMinutes();
          //compute for payment
          if (computedHours < 2) {
            payment = 20;
          } else {
            if (startMin > endMin) {
              payment = (computedHours - 1) * 20;
            } else {
              payment = computedHours * 20;
            }
          }
        }
      }      
      var startTimeF = startDateH.toLocaleTimeString();
      var endTimeF = endDateH.toLocaleTimeString();
      this.updateRequests(key,endDate,payment,carowner.payload.val().carowner.coID);
      this.showPayment(startTimeF, endTimeF, payment, key);
      
      // tempCap  
      let temp = this.afdb.object<any>('requests/' + this.userId ).valueChanges().subscribe(data=>{        
        tempCap = data.available
        temp.unsubscribe();
        tempCap ++;        
        this.afdb.object('requests/' + this.userId ).update({
          available: tempCap
        }); 
      });

    });
  }
  async updateRequests(key,endDate,payment,carowner){
    var push;
    let temp = await this.afdb.list('requests/' + this.userId + '/parkedNode').update(key,
      { 
        status: "pending",
        endTime: endDate, 
        payment:  payment,
        hoID: this.userId
      });     
      let tempPush = await this.afdb.list('requests/' + this.myId + '/parkedNode').snapshotChanges().subscribe(data=>{
        tempPush.unsubscribe();
        for(var i = 0; i < data.length; i++){			
          if(data[i].payload.val().carowner.coID == carowner){    
              this.afdb.list('transactions/').push(data[i].payload.val());
              
          }
        }
      });
      let tempDelete = await this.afdb.list('requests/' + this.userId + '/parkedNode').remove(key); 
  }

  //showPayment
  showPayment(start, end, payment,key) {
    let confirm = this.alertCtrl.create({
      title: 'Payment',
      subTitle: 'Start time: ' + start + '<br>End time: ' + end + '<br>Amount: P' + payment,
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Finish',
        handler: () => {
          let tempDelete = this.afdb.list('requests/' + this.userId + '/parkedNode').remove(key); 
        }
      },]
    });
    confirm.present();
  }


  getRole() {
    this.afdb.object('profile/' + this.userId).snapshotChanges().take(1).subscribe(data => {
      var x = data.payload.val().role;
      console.log(x);
      if (x === 1) {
        this.role = "carowner";
      } else if (x === 2) {
        this.role = "homeowner";
      } else if (x === 3) {
        this.role = "both";
      } else {
        this.role = undefined;
      }
      console.log('ho eto yung role: ' + this.role);
    });
  }

  doConfirm() {
    if (this.toggleValue) {
      this.authProvider.updateHOStatus('online');
    }else{
      let alert = this.alertCtrl.create({
        title: 'Are you sure?',
        message: 'Turning off your availability will make you not appear in the map and you will not receive any requests.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.toggleValue = true;
            }
          },
          {
            text: 'Agree',
            handler: () => {
              this.authProvider.updateHOStatus('offline');
            }
          }
        ],
        enableBackdropDismiss: false
      });

      alert.present();
    }

  }
}
