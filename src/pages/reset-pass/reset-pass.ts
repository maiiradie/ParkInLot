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
  }

  isMatch(field): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      try {            
        if (control.value === control.root.value[field]) {
          return null;
        } else {
          return {'isMatch': false};
        }
      } catch (e) {
        return null;
      }
    }
  } 

  onSubmit() {
    this.authProvider.updatePassword(this.passForm.value['password']);
    this.authProvider.updateIsNew();

    var x = this.authProvider.getUser().subscribe( data => {
      if(data.role == 3) {
        this.navCtrl.setRoot("CoHomePage");
        x.unsubscribe();
      } else if (data.carowner && (data.role == 1 || data.role == undefined)) {
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
