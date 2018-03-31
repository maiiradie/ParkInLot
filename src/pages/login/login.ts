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

  login = {} as Profile;
  profileData:any;

  constructor(public authProvider:AuthProvider, 
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    private toastCtrl:ToastController,
    public loadingCtrl: LoadingController
  ) {
  }

  ionViewDidLoad() {
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
      content: 'Logging in...',   
      dismissOnPageChange: true
		});

    loading.present();    
   this.authProvider.loginUser(this.login)
   .then(() => {
      this.authProvider.setID();
      if (this.authProvider.setID().length != 0) {
        //  this.authProvider.getUser()
        //  .subscribe(role => {
        //    if (role.carowner) {
        //      this.navCtrl.setRoot("CoHomePage");
        //    }else{
        //      this.navCtrl.setRoot("HoHomePage");
        //    }
        //  });
        // this.afs.authState.take(1).subscribe( auth => {
        //   this.afdb.object(`/profile/${auth.uid}`).valueChanges().subscribe( data => {
        //     this.profileData = data;
        //     console.log(this.profileData);
        //     if (this.profileData.reg_status === 'approved') {
        //       this.navCtrl.setRoot("HoprofilePage");
        //     } else if (this.profileData.reg_status === 'rejected') {
        //       this.showToastReject();
        //     } else if (this.profileData.reg_status === 'pending') {
        //       this.showToastPending();
        //     }
        //   });
        // });
        this.authProvider.getUser().subscribe((data)=>{
          if (data.reg_status === "approved") {
            this.navCtrl.setRoot("MenuPage");
          } else if (data.reg_status === "rejected") {
            this.showToastReject();
            loading.dismiss();
          } else {
            this.showToastPending();
            loading.dismiss();
          }
        })

        // this.navCtrl.setRoot("HoprofilePage");
      }

   }).catch((error)=>{
     if (error.code === "auth/arguement-error") {
       this.showToastFields();       
       loading.dismiss();
     } else if (error.code === "auth/invalid-email") {
      this.showToastFormat();
      loading.dismiss();
     } else if (error.code === "auth/user-not-found") {
      this.showToastEmail();
      loading.dismiss();
     } else if (error.code === "auth/wrong-password") {
       this.showToastPassword();
       loading.dismiss();
     }
   })
   return
  }
  
  register(){
  	this.navCtrl.push("RegisterPage");
  }  
}
