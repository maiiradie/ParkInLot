import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';

import { Transaction } from '../../models/transac/transaction.interface';
import { User } from '../../models/user/user.interface';
import { AuthProvider } from '../../providers/auth/auth';
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

  public items: Array<any> = [];
  public itemRef: firebase.database.Reference = firebase.database().ref('/transac');


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private platform: Platform, private afdb: AngularFireDatabase, private authProvider: AuthProvider, private alertCtrl: AlertController) {
    this.isAndroid = platform.is('android');

  //  this.unfiltered = JSON.parse(JSON.stringify(this.afdb.list("transac").valueChanges().subscribe(data => {this.transacData = data;})));
  //  this.userId = this.authProvider.setID();
  //  this.afdb.list("/transac/").valueChanges().subscribe(data => {this.transacData = data.filter(item =>{ 

  //  });});

  //  this.afdb.list('/transac/').snapshotChanges().subscribe(data => {this.transacData = data[0].payload.val()});
    this.afdb.list(`/transac/`).snapshotChanges().subscribe(data => { 
    for(var i = 0; i < data.length; i++){
      this.transacData.push(data[i].payload.val());
      // this.transacData.map( item => {
        
      //    data[i].key;
      // });

      // console.log(data[i].key);

    }
      
     });




  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad HoHomePage');

    // this.itemRef.on('value', itemSnapshot => {
    //   this.items = [];
    //   itemSnapshot.forEach( itemSnap => {
    //     this.items.push(itemSnap.key);
    //     this.items.push(itemSnap.val());
    //     return false;
    //   });
    //   console.log(itemSnapshot);
      
    // });


  }

  getUser(userId: string){
    this.afdb.object(`/profile/userId`).valueChanges().take(1).subscribe( data => {
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

  toParked(transacId: Transaction){
    // this.afdb.object(`/profile/${transacId.$key}`).update({parkStatus: 'parked'});
    console.log(this.transacData);
  }

}
