
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , LoadingController, ToastController} from 'ionic-angular';
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
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
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

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    })
    toast.present();
  }

  editProfile() {
    var check = true;
    const loading = this.loadingCtrl.create({
      content:'Updating profile...'
    });

    var user = firebase.auth().currentUser;
    if (this.userForm.value['email'] != this.profileData.email) {
      user.updateEmail(this.userForm.value['email'])
        .catch((error: "auth/email-already-in-use")=> {
          loading.dismiss();
          this.showToast('Cannot update email. Email already taken or used.');
          check = false;
      })
    }

    if (check) {
      this.afdb.object(`/profile/` + this.userId).update(this.userForm.value)
      .then( () => {
          loading.dismiss();
          this.showToast('Profile updated successfully.');
          this.navCtrl.pop();
      });
    }
  }
}
