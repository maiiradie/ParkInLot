import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

/**
 * Generated class for the CoTransacHistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-co-transac-history',
  templateUrl: 'co-transac-history.html',
})
export class CoTransacHistoryPage {

  transactions; 

  constructor(private afs: AngularFireAuth, private afdb: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CoTransacHistoryPage');
    this.getTransactions();
  }

  getTransactions(){
    var id = this.afs.auth.currentUser.uid;
    this.afdb.list('transactions', ref => ref.orderByChild('coID').equalTo(id)).valueChanges()
    .subscribe( data => {
      alert(id);
      this.transactions = data;
      alert(JSON.stringify(data));
    }); 
  }

}
