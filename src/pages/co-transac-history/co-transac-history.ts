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

  transacQuery1;
  transacQuery2;
  id = this.afs.auth.currentUser.uid;

  constructor(private afs: AngularFireAuth, 
    private afdb: AngularFireDatabase, 
    public navCtrl: NavController, 
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.getTransactions();
  }

  ngOnDestroy(){
    if (this.transacQuery1) {
      this.transacQuery1.unsubscribe();
      if (this.transacQuery2) {
        this.transacQuery2.unsubscribe();
      }
    }
  }

  getTransactions() {
    this.transacQuery1 = this.afdb.list('transactions', ref => ref.orderByChild('coID').equalTo(this.id)).valueChanges()
      .subscribe(data => {

        if (data.length != 0) {  
          var st, et;

          for (let x = 0; x < data.length; x++) {
            this.transactions.push(data[x]);
            st = new Date(this.transactions[x].startTime);
            et = new Date(this.transactions[x].endTime);
            this.transactions[x].ste = st.toLocaleString();
            this.transactions[x].ete = et.toLocaleString();
          }

          this.transactions.reverse();

          for (let a = 0; a < this.transactions.length; a++) {
            this.transacQuery2 = this.afdb.object<any>('profile/' + this.transactions[a].coID).valueChanges().subscribe(name => {
              this.transactions[a].fullName = name.fname + ' ' + name.lname;
            });
          }
        }
        
      });
  }

}
