import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// import { LoginPage } from '../login/login';

import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-coregister',
  templateUrl: 'coregister.html',
})
export class CoregisterPage {
  
  userForm:FormGroup;
 
	constructor(public loadingCtrl: LoadingController,
		private fb: FormBuilder, 
		private authProvider:AuthProvider, 
		public navCtrl: NavController, 
		public navParams: NavParams,
		private toastCtrl: ToastController) {
  	this.userForm = this.fb.group({
	 	'fname':[null,Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
	 	'lname':[null,Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
	 	'email':[null,Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
	 	'password':[null,Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(30)])],
	 	'mobile':[null,Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(11)])],
	});
  }

  ionViewDidLoad() {
	}
	
	showToast() {
    let toast = this.toastCtrl.create({
      message: 'Account was created successfully.',
			duration: 8000
    })
    toast.present();
  }

register(){
	const loading = this.loadingCtrl.create({
		content:'Logging in...'
	});

	loading.present(loading);

	this.authProvider.registerCarOwner(this.userForm.value)
	.then(() => {
	        this.authProvider.setID();
			this.navCtrl.setRoot("MenuCoPage");
			loading.dismiss();
			this.showToast();
	});
 }

}
