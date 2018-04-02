import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController,LoadingController } from 'ionic-angular';

// import { RegisterPage } from '../register/register';

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
  profileData:any;
  x:any;

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

  ionViewDidLeave() {
    if (this.x != undefined) {
      this.x.unsubscribe();
    }
  }

  forgotPassword() {
    this.navCtrl.push("ForgotPasswordPage");
  }

  showToastReject() {
    let toast = this.toastCtrl.create({
      message: 'Cannot login to application. Account request has been rejected by admin.',
      duration: 5000
    })
    toast.present();
  }

  showToastPending() {
    let toast = this.toastCtrl.create({
      message: 'Cannot login to application. Account request has not yet been approved by admin.',
      duration: 5000
    })
    toast.present();
  }

  showToastPassword() {
    let toast = this.toastCtrl.create({
      message: 'The password is incorrect',
      duration: 3000
    })
    toast.present();
  }

  showToastEmail() {
    let toast = this.toastCtrl.create({
      message: 'No user registered with the email',
      duration: 3000
    })
    toast.present();
  }
  showToastFields() {
    let toast = this.toastCtrl.create({
      message: 'Please input email and password',
      duration: 3000
    })
    toast.present();
  }
  showToastFormat() {
    let toast = this.toastCtrl.create({
      message: 'Invalid email address',
      duration: 3000
    })
    toast.present();
  }

  onSignin(){
		let loading = this.loadingCtrl.create({
      content: 'Logging In',
      dismissOnPageChange:true
		});

		loading.present(loading);    
    if((this.login.email != null) && (this.login.password != null)) {
      this.authProvider.loginUser(this.login).then(() => {
        this.authProvider.setID();
        if (this.authProvider.setID().length != 0) {
          this.x =  this.authProvider.getUser().subscribe((data)=>{
            if (data.reg_status === "approved") {
              if (data.carowner) {
                this.x.unsubscribe()
                this.navCtrl.setRoot("CoHomePage").then(data => {
              }, (error) => {
                  alert(error);
              });
              } else if(data.homeowner){
                this.navCtrl.setRoot("HoHomePage");
              }
            } else if (data.reg_status === "rejected") {
              this.showToastReject();
            } else {
              this.showToastPending();
            }
         })
       }
      }).catch((error)=>{
        loading.dismiss();
        if (error.code === "auth/arguement-error") {
          this.showToastFields();
        } else if (error.code === "auth/invalid-email") {
          this.showToastFormat();
        } else if (error.code === "auth/user-not-found") {
          this.showToastEmail();
        } else if (error.code === "auth/wrong-password") {
          this.showToastPassword();
        }
      })
    } else {
      loading.dismiss();
      this.showToastFields();
    }
  }
  
  register(){
  	this.navCtrl.push("RegisterPage");
  }  
}
