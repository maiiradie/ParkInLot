import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-ho-transac-history',
  templateUrl: 'ho-transac-history.html',
})
export class HoTransacHistoryPage {

  role = "";
  userId = this.authProvider.userId;
  transacData: Array<any> = [];
  profData: Array<any> = [];
  transactions = [];
  profileName = [];
  month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November,", "December"];
  transacQuery1;
  transacQuery2;
  selected_month: any;
  selected_year: any;
  years: string[] = ['2018'];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  plateNumbers = [];
  garages: string[];
  selected_car;
  transactionOption = "cars";
  now = new Date(Date.now());
  year = this.now.getFullYear();
  mo = this.now.getMonth();
  storedAmount;
  isError = false;
  paymentData;
  millisNow = Date.now();
  paymentsArray = [];

  constructor(

    public navCtrl: NavController,
    public navParams: NavParams,
    private afdb: AngularFireDatabase,
    private authProvider: AuthProvider) {

    this.selected_month = 'June';
    this.selected_year = '2018';
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
    this.retrieveCars();
    this.getTransactions(this.selected_month, this.selected_car, this.selected_year);
    this.getCompanyTransactions();
    this.savePayments().catch;
  }

  ionViewWillEnter() {
    this.getRole();
  }

  amount = 0;
  amounts = 0;
  amountss = 0;
  monthNum;
  dateMonth: String;
  dueDate;

  async getDueMonth() {
    await new Promise(resolve => {
      this.afdb.list<any>('transactions/', ref => ref.orderByChild('timeStart')).snapshotChanges().take(1).subscribe(data => {
        for (var i = 0; i < data.length; i++) {
          if (data[i].payload.val().hoID == this.userId && data[i].payload.val().status == "pending") {
            let tempDate = new Date(data[i].payload.val().timeStart)
            this.monthNum = tempDate.getMonth();
            this.dateMonth = this.month[this.monthNum];
            this.dueDate = this.daysInMonth(this.monthNum + 1, 2018);
            break
          }
        }
        resolve();
      });
    }).catch(error => { })
  }

  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }



  async getDueAmount() {
    await new Promise(resolve => {
      this.afdb.list<any>('transactions/').snapshotChanges().take(1).subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].payload.val().carowner) {
            if (data[i].payload.val().hoID == this.userId && data[i].payload.val().status == "pending") {
              var tempDate = new Date(data[i].payload.val().timeStart);
              var tempMonth = tempDate.getMonth()
              if (tempMonth == this.monthNum) {
                this.amounts += data[i].payload.val().payment;
                this.amountss = this.amounts;
                this.amount = this.amountss * .20;
                this.updateTransac(data[i].key);
              }
            }
          }
        }
        resolve();
      });
    }).catch(error => { })
  }

  async getTransactions(selected_month, selected_car, selected_year) {
    this.transactions = [];
    this.transacQuery1 = await this.afdb.list<any>('transactions/').snapshotChanges().take(1).subscribe(data => {
      for (let i = data.length - 1; i > -1; i--) {
        if (data[i].payload.val().carowner) {
          var dateStart = new Date(data[i].payload.val().timeStart);
          var moNu = dateStart.getMonth();
          if (this.role == 'homeowner') {

            if (this.months[moNu] == selected_month && data[i].payload.val().hoID == this.userId) {
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
          else if (this.role == 'both') {

            if (data[i].payload.val().carowner) {
              if (this.months[moNu] == selected_month && data[i].payload.val().carowner.plateNumber == this.selected_car && data[i].payload.val().carowner.coID == this.userId) {
                this.afdb.object<any>('profile/' + data[i].payload.val().hoID).valueChanges().take(1).subscribe(prof => {
                  this.afdb.object<any>('location/' + data[i].payload.val().hoID).valueChanges().take(1).subscribe(locationNode => {
                    var dateStart = new Date(data[i].payload.val().timeStart);
                    var moNu = dateStart.getMonth();
                    if (this.months[moNu] == selected_month) {
                      var date = dateStart.toLocaleDateString();
                      var start = dateStart.toLocaleTimeString();
                      var dateEnd = new Date(data[i].payload.val().endTime);
                      var end = dateEnd.toLocaleTimeString();
                      var timeStart = dateStart.toLocaleTimeString();

                      var address = locationNode.address;
                      var obj = {
                        data: data[i].payload.val().hoID,
                        name: prof.fname + ' ' + prof.lname,
                        payment: data[i].payload.val().payment,
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
        }
      }
    });
  }



  getRole() {
    this.afdb.object('profile/' + this.userId).snapshotChanges().take(1).subscribe(data => {
      var x = data.payload.val().role;
      if (x === 1) {
        this.role = "carowner";
      } else if (x === 2) {
        this.role = "homeowner";
      } else if (x === 3) {
        this.role = "both";
      } else {
        this.role = undefined;
      }

    });
    return this.role;
  }

  retrieveCars() {
    this.afdb.list<any>('profile/' + this.userId + '/cars').snapshotChanges().take(1).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.plateNumbers.push(data[i].payload.val().plateNumber);
      }
      this.selected_car = this.plateNumbers[0];
    });
  }

  async savePayments() {
    await this.getDueMonth();
    await this.getDueAmount();
    await this.getStoredAmount();
    console.log("storedAmount: " + this.storedAmount);
    console.log('month: ' + this.dateMonth);
    console.log("amount: " + this.amount)
    console.log('error: ' + this.isError);

    if (this.dateMonth != undefined && this.isError == true) {
      this.afdb.object('payments/' + this.userId + '/' + this.year + '/' + this.mo).set({
        payment: this.amount,
        month: this.dateMonth,
        status: 'pending',
        dateCreated: this.millisNow
      });
    } else if (this.dateMonth != undefined && this.isError == false) {
      this.afdb.object('payments/' + this.userId + '/' + this.year + '/' + this.mo).update({
        payment: this.amount + this.storedAmount,
        dateUpdated: this.millisNow
      });
    }

    await this.getPayments();


  }

  updateTransac(id) {
    this.afdb.object('transactions/' + id).update({
      status: 'counted'
    });
  }

  async getStoredAmount() {
    await new Promise(resolve => {
      this.afdb.object('payments/' + this.userId + '/' + this.year + '/' + this.mo).snapshotChanges().subscribe(data => {
        try {

          this.storedAmount = data.payload.val().payment;

        } catch (error) {
          console.log(error);
          this.isError = true;
          console.log(this.isError);
        }
        resolve();
      });
    })
  }
  async getPayments() {
    await new Promise(resolve => {
      this.afdb.object('payments/' + this.userId + '/' + this.year + '/' + this.mo).snapshotChanges().subscribe(data => {
        if (data.payload.val().status == "pending") {
          this.paymentData = data.payload.val().payment + ".00";
        }
        resolve();
      });
    })
  }


 getCompanyTransactions() {
   this.paymentsArray = [];
  //  for(let a = 1; a<=12; a++) { 
     
     this.transacQuery1 = this.afdb.list<any>('payments/' + this.userId +'/2018').snapshotChanges().take(1).subscribe(data => {
       for (let i = data.length - 1; i > -1; i--) {
        console.log(data[i].payload.val().dateCreated);
           if(data[i].payload) {
             var tem = {
               monthdue: data[i].payload.val().month,
               dueamount: data[i].payload.val().payment,
               status: data[i].payload.val().status,
              }
              this.paymentsArray.push(tem);
            }
        }
      });
    }

}
