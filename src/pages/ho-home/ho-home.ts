import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, MenuController } from 'ionic-angular';
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

  carStatus: string = "Parked";
  arrivingData: Array<any> = [];
  parkedData: Array<any> = [];

  unfiltered;
  filtered;
  arr;
  myId = this.authProvider.setID();
  items: Array<any> = [];
  itemRef: firebase.database.Reference = firebase.database().ref('/transac');

  userId= this.authProvider.userId;
  fname;
  lname;
  hoProfile;
  request;

  constructor(private requestProvider: RequestProvider,
    private afAuth: AngularFireAuth,
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

    this.requestProvider.saveToken();
    this.onNotification();
    menuCtrl.enable(true);
  }

  ionViewDidLoad(){

    this.request = this.afdb.object('requests/' + this.myId).snapshotChanges().subscribe(data => {
      if (data.payload.val().motionStatus == 'arriving') {
        this.arrivingData.push(data);
      } else if (data.payload.val().motionStatus == 'parked') {
        this.parkedData.push(data);
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

  async onNotification() {
    try {
      await this.platform.ready();

      this.fcm.onNotification().subscribe(data => {
        this.afdb.object<any>('profile/' + data.coID).valueChanges().take(1).subscribe(codata => {
          var fname, lname, platenumber;
          fname = codata.fname;
          lname = codata.lname;

          if (data.wasTapped) {
            let confirm = this.alertCtrl.create({
              // add platenumber here
              title: 'You have a parking space request from ' + fname + ' ' + lname,
              enableBackdropDismiss: false,
              buttons: [
                {
                  text: 'Decline',
                  handler: () => {
                    this.requestProvider.declineRequest(data.coID, data.hoID);
                  }
                },
                {
                  text: 'Accept',
                  handler: () => {
                    this.requestProvider.acceptRequest(data.coID, data.hoID);
                  }
                }
              ],
            });

            confirm.present();
          } else {  
            let confirm = this.alertCtrl.create({
              // add platenumber here
              title: 'You have a parking space request from ' + fname + ' ' + lname,
              enableBackdropDismiss: false,
              buttons: [
                {
                  text: 'Decline',
                  handler: () => {
                    this.requestProvider.declineRequest(data.coID, data.hoID);
                  }
                },
                {
                  text: 'Accept',
                  handler: () => {
                    this.requestProvider.acceptRequest(data.coID, data.hoID);
                  }
                }
              ],
            });
            confirm.present();
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


  toParked(transacId: string) {
    this.afdb.object('requests/' + this.myId).update({
      motionStatus: "parked"
    });
    // this.transacData = [];
    this.arrivingData = [];
  }

  startTimer() {
    this.afdb.object('requests/' + this.myId).update({
      startTime: Date.now()
    });
    this.parkedData = [];
  }

  stopTimer() {
    //kunin si stopTime
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

    this.parkedData = [];

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
    // this.transacData = [];
    this.parkedData = [];
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
    });
  }

}
