import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the ResetPassPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reset-pass',
  templateUrl: 'reset-pass.html',
})
export class ResetPassPage {
  passForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private fb:FormBuilder, private authProvider: AuthProvider) {
    this.passForm = this.fb.group({
      'password':[null,Validators.compose([Validators.required, Validators.minLength(6)])],
      'rePassword':[null, Validators.compose([Validators.required, this.isMatch('password')])]
   });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetPassPage');
  }

  isMatch(field): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      try {            
        if (control.value === control.root.value[field]) {
          console.log("true");
          return null;
        } else {
          console.log("false");
          return {'isMatch': false};
        }
      } catch (e) {
        console.log("null");
        return null;
      }
    }
  } 

  onSubmit() {
    this.authProvider.updatePassword(this.passForm.value['password']);
    this.authProvider.updateIsNew();

    var x = this.authProvider.getUser().subscribe( data => {
      if(data.role == 3) {
        console.log('role: ' + data.role);
        this.navCtrl.setRoot("CoHomePage");
        x.unsubscribe();
      } else if (data.carowner && (data.role == 1 || data.role == undefined)) {
         console.log('nakapasok !!!');
        this.navCtrl.setRoot("CoHomePage");
        x.unsubscribe();
      } else if (data.homeowner && (data.role == 2 || data.role == undefined)) {
        this.navCtrl.setRoot("HoHomePage");
        x.unsubscribe();
      } else if (data.establishment) {
        this.navCtrl.setRoot("EstHomePage");
        x.unsubscribe();
      } 
    })
  }
}
