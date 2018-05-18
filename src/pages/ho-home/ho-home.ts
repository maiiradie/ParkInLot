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
  start;
  startTime:boolean = false;
  arriving: boolean = false;
  parked: boolean = false;
  unfiltered;
  filtered;
  arr;
  myId = this.authProvider.setID();
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
        this.authProvider.updateStatus('online');
        this.authProvider.updateOnDisconnect();
      }
    });

    //this.requestProvider.saveToken();
    //this.onNotification();
    menuCtrl.enable(true);
  }

  ionViewDidLoad(){
    this.notificationListener();
    this.request = this.afdb.object('requests/' + this.myId).snapshotChanges().subscribe(data => {
      if (data.payload.val().motionStatus == 'arriving') {
        this.arriving = true;
        this.parked =  false;
      } else if (data.payload.val().motionStatus == 'parked') {
        this.arriving = false;
        this.parked = true;
      }
    });

    this.afdb.object('profile/' + this.userId).valueChanges().take(1)
      .subscribe(profileData => {
        this.hoProfile = profileData;
    });
  }

  ngOnDestroy() {
    this.request.unsubscribe();
  }

  //listens for incoming requests
  notificationListener(){
    this.afdb.object<any>("requests/" + this.userId).valueChanges().subscribe(data=>{
      if(data.reqStatus == "occupied"){
        this.isEnabled = true;    
        this.closeAlrtCtrlOnTimeout();
      }else{
        this.isEnabled = false;
      }
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
    if (evt === "Ho-Menu") {
      this.menuCtrl.enable(true, 'Ho-Menu');
      this.menuCtrl.enable(false, 'Co-Menu');
    } else if (evt === "Co-Menu") {
      this.menuCtrl.enable(false, 'Ho-Menu');
      this.menuCtrl.enable(true, 'Co-Menu');
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

  startTimer() {
    
    this.startTime = true;
    var startTemp = Date.now();
    var tempD = new Date(startTemp);
    this.start = tempD.toLocaleTimeString();
    this.afdb.object('requests/' + this.myId).update({
      startTime: startTemp
    });    
  }

  stopTimer() {
    this.startTime
    //get stopTime
    var endDate = Date.now();
    var endDateH = new Date(endDate);
    var endHour = endDateH.getHours();
    var startDate;
    var computedHours;
    var payment;
    //query to database
    this.afdb.object<any>('requests/' + this.myId).valueChanges().take(1).subscribe(data => {
      startDate = data.startTime;
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
      // push database
      var startTimeF = startDateH.toLocaleTimeString();
      var endTimeF = endDateH.toLocaleTimeString();

      this.showPayment(startTimeF, endTimeF, payment)
      this.afdb.object('requests/' + this.myId).update({
        endTime: endDate,
        payment: payment
      });
      
    });


  }
  //showPayment
  showPayment(start, end, payment) {
    let confirm = this.alertCtrl.create({
      title: 'Payment',
      subTitle: 'Start time: ' + start + '<br>End time: ' + end + '<br>Amount: P' + payment,
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Finish',
        handler: () => {
          this.transfer(this.myId, start, end, payment);
        }
      },]
    });
    confirm.present();
  }

  transfer(hoID, start, end, payment) {
    var temp;
    this.afdb.object<any>('requests/' + this.myId).valueChanges().take(1).subscribe(data => {
      temp = data;
      temp.hoID = hoID;
      this.afdb.list('transactions/').push(temp);
      this.afdb.object<any>('requests/' + this.myId).set({
        coId: "",
        reqStatus: "",
        status: ""
      });
      this.arriving = false;
      this.parked = false;
      this.startTime = false;
    });
  }

  doConfirm() {
    if (this.toggleValue) {
          this.authProvider.updateStatus('online');
    }else{
      let alert = this.alertCtrl.create({
        title: 'Are you sure?',
        message: 'Turning Off you availability will make you not appear in the map and you will not receive any requeasts.',
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
              this.authProvider.updateStatus('offline');
            }
          }
        ],
        enableBackdropDismiss: false
      });

      alert.present();
    }

  }
}
