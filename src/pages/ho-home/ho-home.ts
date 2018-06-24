import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, MenuController, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-ho-home',
  templateUrl: 'ho-home.html',
})
export class HoHomePage {
  incurring_charge = 10;
  role = "";
  parkedCarOwners = [];
  requestingCarOwners = [];
  arrivingCarOwners = [];
  slots = [];
  start;
  startTime: boolean = false;
  arriving: boolean = false;
  parked: boolean = false;
  unfiltered;
  filtered;

  items: Array<any> = [];
  itemRef: firebase.database.Reference = firebase.database().ref('/transac');
  flagAlrtCtrl: boolean = false;
  userId = this.authProvider.userId;
  fname;
  lname;
  hoProfile;
  request;
  parkingRates = [];

  //for toggle of availability
  toggleValue;
  //button toggle for notification
  isEnabled: boolean = false;
  requestAlrtCtrl;
  acceptedTime;

  constructor(
    private afs: AngularFireAuth,
    private toastCtrl: ToastController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private afdb: AngularFireDatabase,
    private authProvider: AuthProvider,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController) {


    let temp = this.afdb.object<any>('profile/' + this.afs.auth.currentUser.uid).valueChanges().subscribe(data => {
      if (data.reg_status != "approved") {
        temp.unsubscribe();
        let tmp = this.afdb.object<any>('requests/' + this.afs.auth.currentUser.uid).valueChanges().subscribe(profData => {
          if (profData.available == profData.capacity) {
            tmp.unsubscribe();
            let toast = this.toastCtrl.create({
              message: 'Account has been disabled',
              duration: 4000,
              position: 'top'
            });
            toast.present();
            this.authProvider.logoutUser()
              .then(() => {
                this.authProvider.updateHOStatus('offline');
                this.menuCtrl.close()
                  .then(() => {
                    this.navCtrl.setRoot('LoginPage');
                  });
              });
          }
        })
      }
    });

    menuCtrl.enable(true);
  }
  myVar = 'pic_angular.jpg'
  async retrieveImg(coID, coPic) {
    await firebase.storage().ref().child("images/" + coID + "/" + coPic).getDownloadURL().then(d => {
      return d;
    }).catch((error) => {
      this.showAlert("There was an error in retrieving the image.", "");
    });
  }

  isTransacting(coID) {
    this.afdb.object('profile/' + coID).update({
      isTransacting: true
    });
  }
  isNotTransacting(coID) {
    this.afdb.object('profile/' + coID).update({
      isTransacting: false,
    });
  }

  ionViewDidLoad() {
    this.getTransactions();
    this.afdb.object('profile/' + this.userId).valueChanges().take(1)
      .subscribe(profileData => {
        this.hoProfile = profileData;
      });
    this.getToggleValue();
  }

  ionViewWillEnter() {
    this.getParkingRate();
    this.getRole();
  }

  getParkingRate() {
    this.afdb.object<any>('profile/' + this.userId).snapshotChanges().take(1).subscribe(data => {
      this.parkingRates.push(data.payload.val().parkingRate);
    });
  }

  getTransactions() {
    this.afdb.list('requests/' + this.userId + '/requestNode').snapshotChanges().subscribe(data => {
      this.requestingCarOwners = data;


    });
    this.afdb.list('requests/' + this.userId + '/arrivingNode').snapshotChanges().subscribe(data => {
      this.arrivingCarOwners = data;
    });
    this.afdb.list('requests/' + this.userId + '/parkedNode').snapshotChanges().subscribe(data => {
      this.parkedCarOwners = data;
    });
  }

  arrived(carowner, key) {
    this.afdb.list('requests/' + this.userId + '/arrivingNode').update(key, {
      status: "transferred"
    });
    this.afdb.list('requests/' + this.userId + '/arrivingNode').remove(key);
    this.afdb.list('requests/' + this.userId + '/parkedNode').push({
      carowner: carowner,
      timeStart: "",
      endTime: "",
      payment: "",
      timeAccepted: this.acceptedTime
    });

  }
  initCancelParked(carowner, key, coID) {
    let tempCap;
    let alert = this.alertCtrl.create({
      title: 'Cancel Transaction',
      subTitle: 'Do you want to cancel the transaction?',
      buttons: [
        {
          text: 'No',
          role: 'no',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.afdb.list<any>('requests/' + this.userId + '/parkedNode').update(key, {
              status: 'cancelled'
            });
            // tempCap  
            let temp = this.afdb.object<any>('requests/' + this.userId).valueChanges().subscribe(data => {
              tempCap = data.available
              temp.unsubscribe();
              tempCap++;
              this.afdb.object('requests/' + this.userId).update({
                available: tempCap
              });
            });
          }
        }
      ]
    });
    alert.present();
  }
  initCancelArriving(carowner, key, coID) {
    let tempCap
    let alert = this.alertCtrl.create({
      title: 'Cancel Transaction',
      subTitle: 'Do you want to cancel the transaction?',
      buttons: [
        {
          text: 'No',
          role: 'no',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.afdb.list<any>('requests/' + this.userId + '/arrivingNode').update(key, {
              status: 'hoCancelled'
            });
            this.isNotTransacting(coID);
            // tempCap  
            let temp = this.afdb.object<any>('requests/' + this.userId).valueChanges().subscribe(data => {
              tempCap = data.available
              temp.unsubscribe();
              tempCap++;
              this.afdb.object('requests/' + this.userId).update({
                available: tempCap
              });
            });

          }
        }
      ]
    });
    alert.present();
  }

  clearArriving(key, coID) {
    this.afdb.list('requests/' + this.userId + '/arrivingNode').remove(key);
  }
  ngOnDestroy() {
    //this.request.unsubscribe();
  }

  //listens for incoming requests

  declineRequest(id, coID) {
    this.afdb.list('requests/' + this.userId + '/requestNode').update(id, { status: "declined" });
    this.afdb.list('requests/' + this.userId + '/requestNode').remove(id);
    this.isNotTransacting(coID);
  }
  async acceptRequest(carowner, id) {
    this.acceptedTime = Date.now();
    //remove list in request
    this.afdb.list('requests/' + this.userId + '/requestNode').update(id, { status: "accepted" });
    this.afdb.list('requests/' + this.userId + '/requestNode').remove(id);
    this.afdb.list('requests/' + this.userId + '/arrivingNode').push({
      carowner,
      status: "arriving",
      timeAccepted: this.acceptedTime
    });
  }
  showNotif() {
    this.requestAlrtCtrl = this.alertCtrl.create({
      title: 'You have a parking space request',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Decline',
          handler: () => {
            this.afdb.object("requests/" + this.userId).set({
              coID: "",
              reqStatus: "declined",
              status: ""
            });

            this.afdb.object("requests/" + this.userId).set({
              coID: "",
              reqStatus: "",
              status: ""
            });
            this.flagAlrtCtrl = false;
          }
        },
        {
          text: 'Accept',
          handler: () => {
            //check if data is not blank
            this.afdb.object<any>("requests/" + this.userId).valueChanges().take(1).subscribe(data => {
              //if data is blank then notify that the request has timedout
              if (data.coID == "" && data.reqStatus == "") {
                let alertTimeout = this.alertCtrl.create({
                  title: 'Request has timed out',
                  buttons: ['OK']
                });
              } else {
                this.afdb.object("requests/" + this.userId).update({
                  reqStatus: "accepted",
                  motionStatus: "arriving",
                  createdAt: Date.now()
                });
              }
            });
            this.arriving = true;

            // else accept the request
            this.flagAlrtCtrl = false;
          }
        }
      ],
    });
    if (!this.flagAlrtCtrl) {
      this.requestAlrtCtrl.present();
      this.flagAlrtCtrl = true;
    }

  }

  closeAlrtCtrlOnTimeout() {
    let temp = this.afdb.object<any>("requests/" + this.userId).valueChanges().subscribe(data => {
      if (data.coID == "" && data.reqStatus == "" && data.status == "") {
        if (this.flagAlrtCtrl) {
          this.requestAlrtCtrl.dismiss();
          this.flagAlrtCtrl = false;
          temp.unsubscribe();
        }
      }
    });
  }

  openMenu(evt) {
    if (evt === "coho-Menu") {
      this.menuCtrl.enable(true, 'coho-Menu');
      this.menuCtrl.enable(false, 'Co-Menu');
      this.menuCtrl.enable(false, 'Ho-Menu');
    } else if (evt === "Ho-Menu") {
      this.menuCtrl.enable(true, 'Ho-Menu');
      this.menuCtrl.enable(false, 'Co-Menu');
      this.menuCtrl.enable(false, 'coho-Menu');
    }
    this.menuCtrl.toggle();
  }

  showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }


  toParked() {
    this.afdb.object('requests/' + this.userId).update({
      motionStatus: "parked"
    });
    this.arriving = false;
    this.parked = true;
  }

  startTimer(carowner, key) {
    this.startTime = true;
    var startTemp = Date.now();
    var tempD = new Date(startTemp);
    var options = {
      hour: "2-digit",
      minute: "2-digit"
    };
    
    this.start = tempD.toLocaleTimeString("en-us", options);
    this.afdb.list('requests/' + this.userId + '/parkedNode').update(key, {
      timeStart: startTemp,
      timeStartFormat: this.start,
      timeAccepted: this.acceptedTime
    });
  }

  stopTimer(carowner, key, coID) {
    this.isNotTransacting(coID);
    var tempCap;
    this.startTime
    //get stopTime
    var endDate = Date.now();
    var endDateH = new Date(endDate);
    var endHour = endDateH.getHours();
    var startDate;
    var computedHours;
    var payment;
    //query to database
    this.afdb.list('requests/' + this.userId + '/parkedNode').snapshotChanges().take(1).subscribe(data => {

      for (var i = 0; i < data.length; i++) {
        if (data[i].payload.val().carowner.coID == carowner.payload.val().carowner.coID) {
          startDate = data[i].payload.val().timeStart;
          //to date of start date
          var startDateH = new Date(startDate);
          //get the hours of the start date
          var startHour = startDateH.getHours();
          //compute for time
          computedHours = endHour - startHour;
          // start time minutes
          var startMin = startDateH.getMinutes();
          //end time minutes
          var endMin = endDateH.getMinutes();
          // compute for payment
          if (computedHours < 2) {
            payment = 20;
          } else {
            if (startMin > endMin) {
              payment = (computedHours - 1) * 20;
            } else {
              payment = computedHours * 20;
            }
          }

          // calculation for incurring charges
          // involves getting the time between accepted time and time parked

          var acceptedTimeH = new Date(this.acceptedTime);
          // start time for accepted time
          var acceptedTimeHour = acceptedTimeH.getHours();
          // calculating the hours between where startHour is the end time of the accepted time 
          var calculattedInccuredHrs = startHour - acceptedTimeHour;
          // getting the minutes of the time accepted
          var acceptedTimeMin = acceptedTimeH.getMinutes();
          var incurredCharge;
          if (calculattedInccuredHrs < 2) {
            incurredCharge = 10;
          } else {
            if (acceptedTimeMin > startMin) {
              incurredCharge = (calculattedInccuredHrs - 1) * this.incurring_charge;
            } else {
              incurredCharge = calculattedInccuredHrs * this.incurring_charge;
            }
          }
        }
      }
      var startTimeF = startDateH.toLocaleTimeString();
      var endTimeF = endDateH.toLocaleTimeString();
      var acceptedStartTime = acceptedTimeH.toLocaleTimeString();
      var total_payment = incurredCharge + payment;
      this.updateRequests(key, endDate, total_payment, carowner.payload.val().carowner.coID);
      this.showPayment(startTimeF, endTimeF, payment, key, incurredCharge, acceptedStartTime);

      // tempCap  
      let temp = this.afdb.object<any>('requests/' + this.userId).valueChanges().subscribe(data => {
        tempCap = data.available
        temp.unsubscribe();
        tempCap++;
        this.afdb.object('requests/' + this.userId).update({
          available: tempCap
        });
      });

    });
  }
  async updateRequests(key, endDate, payment, carowner) {
    let temp = await this.afdb.list('requests/' + this.userId + '/parkedNode').update(key,
      {
        status: "pending",
        endTime: endDate,
        payment: payment,
        hoID: this.userId
      });
    let tempPush = await this.afdb.list('requests/' + this.userId + '/parkedNode').snapshotChanges().subscribe(data => {
      tempPush.unsubscribe();
      for (var i = 0; i < data.length; i++) {
        if (data[i].payload.val().carowner.coID == carowner) {
          this.afdb.list('transactions/').push(data[i].payload.val());

        }
      }
    });
    let tempDelete = await this.afdb.list('requests/' + this.userId + '/parkedNode').remove(key);
  }

  //showPayment
  showPayment(start, end, payment, key, incurredCharge, acceptedStartTime) {
    let confirm = this.alertCtrl.create({
      title: 'Payment',
      subTitle: '<b>Arriving</b> <br><br> Rate: P10.00/hr <br> Time started: '
        + acceptedStartTime
        + '<br>Time ended: ' + start + '<br>Incurred Charges: P' + incurredCharge + '.00'
        + '<br><br> <b>Parking</b> <br><br> Time parked: '
        + start
        + '<br>Time ended: ' + end + '<br>Incurred Charges: P' + payment
        + '<br><br> <b> TOTAL PAYMENT: </b>'
        + (incurredCharge + payment) +'.00'
      ,
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Finish',
        handler: () => {
          let tempDelete = this.afdb.list('requests/' + this.userId + '/parkedNode').remove(key);
        }
      },]
    });
    confirm.present();
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
  }

  doConfirm() {
    if (this.toggleValue) {
      this.authProvider.updateHOStatus('online');
    } else {
      let alert = this.alertCtrl.create({
        title: 'Are you sure?',
        message: 'Turning off your availability will make you not appear in the map and you will not receive any requests.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.toggleValue = true;
            }
          },
          {
            text: 'Agree',
            handler: () => {
              this.authProvider.updateHOStatus('offline');
            }
          }
        ],
        enableBackdropDismiss: false
      });

      alert.present();
    }

  }

  getToggleValue() {

    this.afdb.object('profile/' + this.userId).snapshotChanges().take(1).subscribe(data => {
      if (data.payload.val().role == 3) {
        this.afdb.object('location/' + this.userId).snapshotChanges().take(1).subscribe(data => {
          if (data.payload.val().status == 'online') {
            this.toggleValue = true;
          } else {
            this.toggleValue = false;
          }
        });
      } else {
        this.toggleValue = true;
      }
    });
  }

}
