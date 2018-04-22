
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase';
import 'rxjs/add/operator/take';

@IonicPage()
@Component({
  selector: 'page-est-edit-profile',
  templateUrl: 'est-edit-profile.html',
})
export class EstEditProfilePage {

  profileData:any;
  userForm:FormGroup;
  userId = this.authProvider.userId;
  profile$: AngularFireObject<any>;

  constructor(private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private authProvider: AuthProvider,
    private fb:FormBuilder) {
      this.userForm = this.fb.group({
        'estbname':[null,Validators.compose([Validators.required, Validators.minLength(2)])],
        'email':[null,Validators.compose([Validators.required, Validators.email])],
    		'capacity':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11)])],
    		'rate':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11)])],
    		'regularPrice':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11)])],
    		'overnightPrice':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11)])],
        'operatingHours':[null,Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(20)])],
     });
  }

  ionViewDidLoad(){
      this.afdb.object(`/profile/` + this.userId).valueChanges().take(1).subscribe( data => {
        this.profileData = data;
      });
  }

  editProfile(){
    this.afdb.object(`/profile/` + this.userId).update(this.userForm.value)
    .then( () => {
        this.navCtrl.pop();
    });
  }

}
