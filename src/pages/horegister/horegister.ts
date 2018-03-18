import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,  LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HomehoPage } from '../homeho/homeho';

import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-horegister',
  templateUrl: 'horegister.html',
})
export class HoregisterPage {

  userForm:FormGroup;

  constructor(public loadingCtrl: LoadingController, private fb:FormBuilder,private authProvider: AuthProvider, public navCtrl: NavController, public navParams: NavParams) {
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

  onSubmitHO(){
	const loading = this.loadingCtrl.create({
		content:'Getting your location...'
	});

	loading.present(loading);

  	this.authProvider.locateHO()
  	.subscribe( location => {
		this.authProvider.registerHomeOwner(this.userForm.value,location)
		.then(() => {
		        this.authProvider.setID();
				this.navCtrl.setRoot(HomehoPage);
				loading.dismiss();
		});
  	});
 }

}
