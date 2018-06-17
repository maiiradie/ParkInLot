import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController,LoadingController, AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  login = {} as any;
  profileData;
  x;
  splash = true;

  constructor(public authProvider:AuthProvider, 
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    private toastCtrl:ToastController,
    private loadingCtrl:LoadingController, 
    private alertCtrl:AlertController) {

      try{
        if(this.afs.auth.currentUser.uid){
          this.afdb.object<any>('profile/' + this.afs.auth.currentUser.uid).valueChanges().take(1).subscribe(data=>{
            if(data.role == 3) {
              this.navCtrl.setRoot("CoHomePage");
            } else if (data.carowner && (data.role == 1 || data.role == undefined)) {
              this.navCtrl.setRoot("CoHomePage");
            } else if (data.homeowner && (data.role == 2 || data.role == undefined)) {
              this.navCtrl.setRoot("HoHomePage");
            }else if(data.establishment && (data.role == 4 || data.role == undefined)){
              this.navCtrl.setRoot("EstHomePage");
            } 
          });
        }
      }catch(e){
        console.log(e);
      }
      
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.splash = false;
      // this.tabBarElement.style.display = 'flex';
    }, 4000);
  }

  profile = []
  transactions = []
  async getProfile(profile,amount){
    let temp = await this.afdb.object<any>('profile/' + profile).snapshotChanges().take(1).subscribe(data=>{
      var temp = {
        name: data.payload.val().email,
        amount,
      }
      this.transactions.push(temp);

    });
  }
  
  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000
    })
    toast.present();
  }

  onSignin(){
		let loading = this.loadingCtrl.create({
      content: 'Logging In'
		});

    loading.present(loading).then( () => {
      if ((this.login.email != null) && (this.login.password != null)) {
        this.authProvider.loginUser(this.login).then(() => {
          this.authProvider.setID();

          if (this.authProvider.setID().length != 0) {
            this.x = this.authProvider.getUser().subscribe((data) => {
              if (data.isNew) {
                this.navCtrl.setRoot("ResetPassPage");
                loading.dismiss();
              } else {
                if (data.reg_status === "approved") {
                  if(data.role == 3) {
                    this.navCtrl.setRoot("CoHomePage");
                    this.x.unsubscribe();
                  } else if (data.carowner && (data.role == 1 || data.role == undefined)) {
                    this.navCtrl.setRoot("CoHomePage");
                    this.x.unsubscribe();
                  } else if (data.homeowner && (data.role == 2 || data.role == undefined)) {
                    this.navCtrl.setRoot("HoHomePage");
                    this.x.unsubscribe();
                  }else if(data.establishment && (data.role == 4 || data.role == undefined)){
                    this.navCtrl.setRoot("EstHomePage");
                    this.x.unsubscribe();
                  } 
                } else if (data.reg_status === "rejected") {
                  this.showToast('Cannot login to application. Account request has been rejected by admin.');
                } else if (data.establishment) {
                  this.navCtrl.setRoot("EstHomePage");
                  this.x.unsubscribe();
                } else if(data.reg_status === "disabled"){
                  this.showToast('Your account has been disabled contact ParkInLot for assistance');
                  this.x.unsubscribe();
                }else {
                  this.x.unsubscribe();
                  this.showToast('Cannot login to application. Account request has not yet been approved by admin.');
                }
                loading.dismiss();
              }
            });
          }

        }).catch((error) => {
          loading.dismiss();
          if (error.code === "auth/network-request-failed") {
            this.showToast('Cannot login. No internet connection.');
          } else if (error.code === "auth/invalid-email") {
            this.showToast('Invalid email address');
          } else if (error.code === "auth/user-not-found") {
            this.showToast('No user registered with the email');
          } else if (error.code === "auth/wrong-password") {
            this.showToast('The password is incorrect');
          } else {
            this.showAlert("There was an error while logging in.", "");
          }
        });

      } else {
        loading.dismiss();
        this.showToast('Please input email and password');
      }

    });
  }

showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }

  forgotPassword() {
    this.navCtrl.push("ForgotPasswordPage");
  }
  
  register(){
  	this.navCtrl.push("CoregisterPage");
  }  
}