import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-ho-transac-history',
  templateUrl: 'ho-transac-history.html',
})
export class HoTransacHistoryPage {

  userId = this.authProvider.userId;
  transacData: Array<any> = [];
  profData: Array<any> = [];
  transactions = [];
  profileName = [];
  
  transacQuery1;
  transacQuery2;

  constructor(private afs:AngularFireAuth,
      public navCtrl: NavController,
      public navParams: NavParams,
      private afdb: AngularFireDatabase, 
      private authProvider: AuthProvider) {   
  }
  ngOnDestroy() {
    this.transacQuery1.unsubscribe();
    this.transacQuery2.unsubscribe();
  }

  ionViewDidLoad() {
    this.getTransactions();
  }

  getTransactions() {
    this.transacQuery1 = this.afdb.list('transactions', ref => ref.orderByChild('hoID').equalTo(this.userId)).valueChanges()
      .subscribe(data => {
        
        var st, et;

        for (let x = 0; x < data.length; x++) {
          this.transactions.push(data[x]);
          st = new Date(this.transactions[x].startTime);
          et = new Date(this.transactions[x].endTime);
          this.transactions[x].ste = st.toLocaleString();
          this.transactions[x].ete = et.toLocaleString();

          this.transacQuery2 = this.afdb.object<any>('profile/' + this.transactions[x].coID).valueChanges().subscribe(name => {
            this.transactions[x].fullName = name.fname +' ' +name.lname;
          });
        }
      });
  }
}
