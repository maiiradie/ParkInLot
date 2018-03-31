import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController } from 'ionic-angular';
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

  carStatus: string = "Parked";
  isAndroid: boolean = false;

  carStatuses = ['Arriving', 'Parked'];

  transacData: Array<any> = [];
  userData: any;
  unfiltered: any;
  filtered: any;
  private userId;
  arr: any;
  myId = this.authProvider.setID();

  public items: Array<any> = [];
  public itemRef: firebase.database.Reference = firebase.database().ref('/transac');


  constructor(private requestProvider: RequestProvider, private fcm: FCM, public navCtrl: NavController, public navParams: NavParams,
    private platform: Platform, private afdb: AngularFireDatabase, private authProvider: AuthProvider, private alertCtrl: AlertController) {
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

    this.afdb.list(`/transac/`).snapshotChanges().subscribe(data => {

      data.forEach(element => {
        if (element.payload.val().ho == this.myId) {
          this.transacData.push(element);
        }
      })

    });

  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad HoHomePage');
  }

  getUser(userId: string) {
    this.afdb.object(`/profile/userId`).valueChanges().take(1).subscribe(data => {
      this.userData = data;
    });
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
    this.afdb.object(`/transac/${transacId}`).update({ parkStatus: 'parked' });
    this.transacData = [];

  }

}
