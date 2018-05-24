import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import { query } from '@angular/core/src/animation/dsl';

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
    if (this.transacQuery1) {
      this.transacQuery1.unsubscribe();
      if (this.transacQuery2) {
        this.transacQuery2.unsubscribe();  
      }
    }
  }

  ionViewDidLoad() {
    this.getTransactions();
  }

  async getTransactions() {
    this.transacQuery1 = await this.afdb.list<any>('transactions/').snapshotChanges().take(1).subscribe(data => {
      for(let i = 0; i < data.length; i++){
        
        if(data[i].payload.val().carowner){            
          if(data[i].payload.val().hoID == this.userId){
            this.transactions.push(data[i].payload.val());
        }  
      }
    }
  });
}
}
