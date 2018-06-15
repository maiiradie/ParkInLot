import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';

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
  userId = this.authProvider.userId;
  selected_month: any;
  selected_year: any;
  years: string[] = ['2018'];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


  constructor(private afs: AngularFireAuth, 
    private authProvider: AuthProvider,
    private afdb: AngularFireDatabase, 
    public navCtrl: NavController, 
    public navParams: NavParams) {
    this.selected_month = 'June';
    this.selected_year = '2018';
  }

  ionViewDidLoad() {
    this.getTransactions(this.selected_month);
  }

  ngOnDestroy(){
    if (this.transacQuery1) {
      this.transacQuery1.unsubscribe();
      if (this.transacQuery2) {
        this.transacQuery2.unsubscribe();
      }
    }
  }

  async getTransactions(selected_month) {
  this.transactions = [];
    this.transacQuery1 = await this.afdb.list<any>('transactions/').snapshotChanges().take(1).subscribe(data => {
        for(let i = 0; i < data.length; i++){

          if(data[i].payload.val().carowner){            
            if(data[i].payload.val().carowner.coID == this.userId){
               this.afdb.object<any>('profile/' + data[i].payload.val().hoID).valueChanges().take(1).subscribe(prof=>{
                 this.afdb.object<any>('location/' + data[i].payload.val().hoID).valueChanges().take(1).subscribe(locationNode => {
                var dateStart = new Date(data[i].payload.val().timeStart);
                 var moNu = dateStart.getMonth();
                 if (this.months[moNu] == selected_month) {
                var date = dateStart.toLocaleDateString();
                var start = dateStart.toLocaleTimeString();
                var dateEnd = new Date(data[i].payload.val().endTime);
                var end = dateEnd.toLocaleTimeString();

                var address = locationNode.address;
                console.log(address);
                var obj = {
                  data: data[i].payload.val().hoID,
                  name: prof.fname + ' ' +prof.lname,
                  payment:data[i].payload.val().payment,
                  date,
                  start,  
                  end,
                  address
                }
                this.transactions.push(obj);
              }
              });
              });
            }
          }  
        }
        
      });
  }

}
