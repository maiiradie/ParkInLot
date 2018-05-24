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

async getTransactions() {
      // this.afdb.list('transactions/').valueChanges().take(1).subscribe(data=>{
      //   this.transactions = data
      // });
    this.transacQuery1 = await this.afdb.list<any>('transactions/').snapshotChanges().take(1).subscribe(data => {
        console.log(this.id);
        for(let i = 0; i < data.length; i++){

          if(data[i].payload.val().carowner){            
            if(data[i].payload.val().carowner.coID == this.id){
               this.afdb.object<any>('profile/' + data[i].payload.val().hoID).valueChanges().take(1).subscribe(prof=>{

                var obj = {
                  data: data[i].payload.val().hoID,
                  name: prof.fname,
                  payment:data[i].payload.val().payment
                }
                this.transactions.push(obj);
              });
            }
          }  
        }
        
      });
  }

}
