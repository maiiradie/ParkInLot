import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController,LoadingController } from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Profile } from '../../models/profile';
// import { Garage } from '../../models/garage';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  login = {} as any;
  profileData;
  x;

  constructor(public authProvider:AuthProvider, 
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    private toastCtrl:ToastController,
    private loadingCtrl:LoadingController) {
  }

  ionViewDidLoad() {
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
      if ((this.login.email != null) || (this.login.password != null)) {
        this.authProvider.loginUser(this.login).then(() => {

          this.authProvider.setID();

          if (this.authProvider.setID().length != 0) {

            this.x = this.authProvider.getUser().subscribe((data) => {
              if (data.reg_status === "approved") {
                if (data.carowner) {
                  this.navCtrl.setRoot("CoHomePage");
                  this.x.unsubscribe();
                } else if (data.homeowner) {
                  this.navCtrl.setRoot("HoHomePage");
                  this.x.unsubscribe();
                } 
              } else if (data.reg_status === "rejected") {
                this.showToast('Cannot login to application. Account request has been rejected by admin.');
              } else if (data.establishment) {
                this.navCtrl.setRoot("EstHomePage");
                this.x.unsubscribe();
              } else {
                this.showToast('Cannot login to application. Account request has not yet been approved by admin.');
              }
              loading.dismiss();
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
          }
        });

      } else {
        loading.dismiss();
        this.showToast('Please input email and password');
      }

    });
  }

  forgotPassword() {
    this.navCtrl.push("ForgotPasswordPage");
  }
  
  register(){
  	this.navCtrl.push("CoregisterPage");
  }  
}