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
  month = ["January","February","March","April","May","June","July","August","September","October","November,","December"];
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
    this.getDueMonth()
    this.getDueAmount();
  }
  amount = 0;
  amounts = 0;
  amountss = 0 ;
  monthNum;
  dateMonth:String;
  async getDueMonth(){
    let temp = await this.afdb.list<any>('transactions/',ref =>ref.orderByChild('timeStart')).snapshotChanges().take(1).subscribe(data=>{
      for(var i = 0; i < data.length; i++){
        if(data[i].payload.val().hoID == this.userId && data[i].payload.val().status == "pending"){          
          let tempDate = new Date(data[i].payload.val().timeStart)
          this.monthNum = tempDate.getMonth();
          this.dateMonth = this.month[this.monthNum]; 
          break
        }
      }
    });
  }
  async getDueAmount(){
    let temp = await this.afdb.list<any>('transactions/').snapshotChanges().take(1).subscribe(data => {
      for(let i = 0; i < data.length; i++){  
        if(data[i].payload.val().carowner){            
          if(data[i].payload.val().hoID == this.userId && data[i].payload.val().status == "pending"){
            var tempDate = new Date(data[i].payload.val().timeStart);
            var tempMonth = tempDate.getMonth()
            if(tempMonth == this.monthNum){
              this.amounts += data[i].payload.val().payment;
              this.amountss = this.amounts;
              this.amount = this.amountss * .20;
            }

          }
        }
      }
    });
  }

  async getTransactions() {
    this.transacQuery1 = await this.afdb.list<any>('transactions/').snapshotChanges().take(1).subscribe(data => {
      for(let i = data.length - 1; i > -1; i--){        
        if(data[i].payload.val().carowner){            
          if(data[i].payload.val().hoID == this.userId){
            var dateStart = new Date(data[i].payload.val().timeStart);
            var date = dateStart.toLocaleDateString();
            var start = dateStart.toLocaleTimeString();
            var dateEnd = new Date(data[i].payload.val().endTime);
            var endTime = dateEnd.toLocaleTimeString();
            var timeStart = dateStart.toLocaleTimeString();
            var timeEnd; 
            var temp = {
              name: data[i].payload.val().carowner.name,
              date: date,
              start: start,
              end: endTime,
              payment: data[i].payload.val().payment,
              

            }
            this.transactions.push(temp);
        }  
      }
    }
  });
}
}
