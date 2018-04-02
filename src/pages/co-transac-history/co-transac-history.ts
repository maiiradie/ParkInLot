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

  transactions = [];
  profileName = [];


  constructor(private afs: AngularFireAuth, private afdb: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CoTransacHistoryPage');
    this.getTransactions();
  }

  getTransactions() {
    var id = this.afs.auth.currentUser.uid;
    var u = this.afdb.list('transactions', ref => ref.orderByChild('coID').equalTo(id)).valueChanges()
      .subscribe(data => {

        var st, et;

        for (let x = 0; x < data.length; x++) {
          this.transactions.push(data[x]);
          st = new Date(this.transactions[x].startTime);
          et = new Date(this.transactions[x].endTime);
          this.transactions[x].ste = st.toLocaleString();
          this.transactions[x].ete = et.toLocaleString();
          u.unsubscribe();
          this.afdb.object<any>('profile/' + this.transactions[x].hoID).valueChanges().subscribe(name => {
            this.transactions[x].fullName = name.fname +' ' +name.lname;
          });
        }

      });
  }

}
