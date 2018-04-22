import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
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
  location;
  imgName;
  private userId = this.authProvider.userId;
  

  constructor(private afdb:AngularFireDatabase,
    private afs:AngularFireAuth,
    private authProvider: AuthProvider,
    public navCtrl: NavController, 
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
      this.afdb.object(`profile/` + this.userId).valueChanges().take(1).subscribe( data => {
        this.userData = data;
        this.retrieveImg();

        this.afdb.object(`location/` + this.userId).valueChanges().take(1).subscribe( out => {
          this.location = out;
        });
      });
  }

  retrieveImg() { 
      firebase.storage().ref().child("images/" + this.userId + "/" + this.userData.garagePic).getDownloadURL().then(d=>{
        this.imgName = d;
      }).catch((error)=>{
        alert(JSON.stringify(error));
      })  
  }

  editGarage() {
    this.navCtrl.push("HoEditGaragePage");
  }
}
