import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';
import 'rxjs/add/operator/take';

@IonicPage()
@Component({
  selector: 'page-ho-garage',
  templateUrl: 'ho-garage.html',
})
export class HoGaragePage {
  userData;
  details = "";
  location;
  imgName;
  requestData;
  private userId = this.authProvider.userId;
  

  constructor(private afdb:AngularFireDatabase,
    private authProvider: AuthProvider,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
      this.afdb.object(`profile/` + this.userId).valueChanges().take(1).subscribe( data => {
        this.userData = data;
        this.retrieveImg();

        // for(var i = 0; i < this.userData.details.length; i++) {
        //   console.log(this.userData.details)
        //   this.details = this.details + this.userData.details[i];
        //   console.log(this.userData.details[i])
        //   var temp = i + 1;
        //   if(temp < this.userData.details.length) {
        //     this.details = this.details + ", ";
        //   }
        // }
        console.log(this.details);

        this.afdb.object(`location/` + this.userId).valueChanges().take(1).subscribe( out => {
          this.location = out;
        });

        this.afdb.object(`/requests/` + this.userId).valueChanges().take(1).subscribe(out2 => {
          this.requestData = out2;
        })
      });
  }

  retrieveImg() { 
      firebase.storage().ref().child("images/" + this.userId + "/" + this.userData.garagePic).getDownloadURL().then(d=>{
        this.imgName = d;
      }).catch((error)=>{
        this.showAlert("There was an error in retrieving the image.", "");
      })  
  }

    showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }

  editGarage() {
    this.navCtrl.push("HoEditGaragePage");
  }
}
