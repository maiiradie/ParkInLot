import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import firebase from 'firebase';

/**
 * Generated class for the ForgotPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  reset = {} as any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotPasswordPage');
  }
  
  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Password Reset Email Sent',
      subTitle: 'A password reset email has been sent in your email account.',
      buttons: ['OK']
    });
    alert.present();
  }

  showToastEmail() {
    let toast = this.toastCtrl.create({
      message: 'No user registered with the email.',
      duration: 3000
    })
    toast.present();
  }

  showToastFields() {
    let toast = this.toastCtrl.create({
      message: 'Please input an email.',
      duration: 3000
    })
    toast.present();
  }
  showToastFormat() {
    let toast = this.toastCtrl.create({
      message: 'Invalid email address.',
      duration: 3000
    })
    toast.present();
  }

  resetPassword() {
    if (this.reset.email != null) {
      firebase.auth().sendPasswordResetEmail(this.reset.email).then(() => {
        this.showAlert();
        this.navCtrl.pop();
      }).catch((error) => {
        if (error.code === "auth/invalid-email") {
          this.showToastFormat();
        } else if(error.code === "auth/user-not-found") {
          this.showToastEmail();
        }
      })
    } else {
      this.showToastFields();
    }
  }
}
