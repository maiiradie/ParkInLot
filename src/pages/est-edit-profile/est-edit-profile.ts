
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , LoadingController, ToastController} from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import firebase from 'firebase';
import moment from 'moment';
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
  opening:any;
  closing:any;

  constructor(private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    private fb:FormBuilder) {
      this.userForm = this.fb.group({
        'email':[null,Validators.compose([Validators.required, Validators.email])],
    		'capacity':[null,Validators.compose([Validators.required])],
    		'rate':[''],
    		'regularPrice':[null,Validators.compose([Validators.required])],
    		'overnightPrice':[null,Validators.compose([Validators.required])],
        'openingTime':[null,Validators.compose([Validators.required, this.isBeforeClosing('closingTime')])],
        'closingTime':[null,Validators.compose([Validators.required, this.isAfterOpening('openingTime')])]
     });
  }

  ionViewDidLoad(){
      this.afdb.object(`/profile/` + this.userId).valueChanges().take(1).subscribe( data => {
        this.profileData = data;
        this.opening = this.profileData.openingTime; 
        this.closing = this.profileData.closingTime;
        console.log(this.opening + " " + this.closing);
      });
  }

  isAfterOpening(field): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      try {
        var closeH = parseInt(control.value.substring(0, control.value.indexOf(":")));
        var openH = parseInt(control.root.value[field].substring(0, control.root.value[field].indexOf(":")));
        var closeM = parseInt(control.value.substring(control.value.indexOf(":") + 1));
        var openM = parseInt(control.root.value[field].substring(control.root.value[field].indexOf(":") + 1));
            
        if ((closeH > openH) || ((closeH == openH) && (closeM > openM))) {
          console.log("true");
          return null;
        } else {
          console.log("false");
          return {'isAfterOpening': false};
        }
      } catch (e) {
        console.log("null");
        return null;
      }
    }
  }

  isBeforeClosing(field): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      try {
        var openH = parseInt(control.value.substring(0, control.value.indexOf(":")));
        var closeH = parseInt(control.root.value[field].substring(0, control.root.value[field].indexOf(":")));
        var openM = parseInt(control.value.substring(control.value.indexOf(":") + 1));
        var closeM = parseInt(control.root.value[field].substring(control.root.value[field].indexOf(":") + 1));
            
        if ((closeH > openH) || ((closeH == openH) && (closeM > openM))) {
          console.log("true");
          return null;
        } else {
          console.log("false");
          return {'isBeforeClosing': false};
        }
      } catch (e) {
        console.log("null");
        return null;
      }
    }
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
