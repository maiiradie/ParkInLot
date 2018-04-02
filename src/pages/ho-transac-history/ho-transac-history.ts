import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { AuthProvider } from '../../providers/auth/auth';
/**
 * Generated class for the HoTransacHistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ho-transac-history',
  templateUrl: 'ho-transac-history.html',
})
export class HoTransacHistoryPage {

  userId = this.authProvider.setID();
  transacData: Array<any> = [];
  profData: Array<any> = [];

  transactions = [];
  profileName = [];
  

  constructor(private afs:AngularFireAuth,
    public navCtrl: NavController,
     public navParams: NavParams,
      private afdb: AngularFireDatabase, 
      private authProvider: AuthProvider) {
    this.afdb.list('transac').snapshotChanges().subscribe(data => {
      data.forEach(element => {
        console.log("hey");
        if(element.payload.val().ho == this.userId){
          this.transacData.push(element);
          console.log(element.payload.val());
          
        console.log("heyy");
        // this.profSearch(`${element.payload.val().co}`);
          
          this.afdb.object(`profile/${element.payload.val().co}`).valueChanges().subscribe( prof => {
            console.log("heyyy");
              // prof.forEach(profElement => {
                this.profData.push(prof);
              console.log(prof);
                
              // })
        
          });

        }
      });
    });

    this.getTransactions();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HoTransacHistoryPage');
  }


  getTransactions() {
    var id = this.afs.auth.currentUser.uid;
    var u = this.afdb.list('transactions', ref => ref.orderByChild('hoID').equalTo(id)).valueChanges()
      .subscribe(data => {

        var st, et;

        for (let x = 0; x < data.length; x++) {
          this.transactions.push(data[x]);
          st = new Date(this.transactions[x].startTime);
          et = new Date(this.transactions[x].endTime);
          this.transactions[x].ste = st.toLocaleString();
          this.transactions[x].ete = et.toLocaleString();
          u.unsubscribe();
          this.afdb.object<any>('profile/' + this.transactions[x].coID).valueChanges().subscribe(name => {
            this.transactions[x].fullName = name.fname +' ' +name.lname;
          });
        }

      });
  }

}
