import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, MenuController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';

import { Transaction } from '../../models/transac/transaction.interface';
import { User } from '../../models/user/user.interface';
import { AuthProvider } from '../../providers/auth/auth';

import { RequestProvider } from '../../providers/request/request';
import { FCM } from '@ionic-native/fcm';
/**
 * Generated class for the HoHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ho-home',
  templateUrl: 'ho-home.html',
})
export class HoHomePage {

  carStatus: string = "parked";
  isAndroid: boolean = false;

  carStatuses = ['arriving', 'parked'];

  transacData: Array<any> = [];
  userData: any;
  unfiltered: any;
  filtered: any;
  private userId;
  arr: any;
  myId = this.authProvider.setID();
  public items: Array<any> = [];
  public itemRef: firebase.database.Reference = firebase.database().ref('/transac');

  public fname;
  public lname;
  constructor(private requestProvider: RequestProvider, private fcm: FCM, public navCtrl: NavController, public navParams: NavParams,
    private platform: Platform, private afdb: AngularFireDatabase, private authProvider: AuthProvider, private alertCtrl: AlertController,
    private menuCtrl: MenuController) {
    this.isAndroid = platform.is('android');

    platform.ready().then(() => {
      this.requestProvider.saveToken();

      this.fcm.onNotification().subscribe(data => {

        this.afdb.object<any>('profile/' + data.coID).valueChanges().subscribe(codata => {
          var fname, lname, platenumber: any;
          fname = codata.fname;
          lname = codata.lname;
          platenumber = 'ABC-169';
          if (data.wasTapped) {

          } else {

            let confirm = this.alertCtrl.create({
              // add platenumber here
              title: 'You have a parking space request from ' + fname + ' ' + lname,
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
              ]
            });
            confirm.present();
          };
        });
      });
    });



    var x = this.afdb.object(`requests/` + this.myId).snapshotChanges().subscribe(data => {
      this.transacData.push(data);
      this.afdb.object('profile/' + data.payload.val().coID).valueChanges()
        .subscribe(profileData => {
          this.hoProfile = profileData;
        });
    });

    menuCtrl.enable(true);

  }

  hoProfile;


  ionViewDidLoad() {
    console.log('ionViewDidLoad HoHomePage');
  }

  getUser(userId: string) {
    this.afdb.object(`/profile/userId`).valueChanges().take(1).subscribe(data => {
      this.userData = data;
    }).unsubscribe();
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'hey you just entered this',
      subTitle: 'Your email is already taken or used.',
      buttons: ['OK']
    });
    alert.present();
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

  toParked(transacId: string) {

    this.afdb.object('requests/' + this.myId).update({
      motionStatus: "parked"
    });
    this.transacData = [];

  }
  startTimer() {
    this.afdb.object('requests/' + this.myId).update({
      startTime: Date.now()
    });

    this.transacData = [];

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
    var x = this.afdb.object<any>('requests/' + this.myId).valueChanges().subscribe(data => {
      startDate = data.startTime;
      //to date of start date
      var startDateH = new Date(startDate);
      //get the hours of the start date
      var startHour = startDateH.getHours();
      //compute for time
      computedHours = endHour - startHour;
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
      x.unsubscribe();
      this.afdb.object('requests/' + this.myId).update({
        endTime: endDate,
        payment: payment
      });
    });
    this.transacData = [];
  }
  transfer(hoID) {
    var temp;
    var x = this.afdb.object<any>('requests/' + this.myId).valueChanges().subscribe(data => {
      temp = data;
      console.log(data);
      x.unsubscribe();
      this.afdb.list('transactions/' + hoID).push(temp);
      this.afdb.object<any>('requests/' + this.myId).set({
        coId: "",
        reqStatus: "",
        status: ""
      })
    })
    this.transacData = [];
  }
}
