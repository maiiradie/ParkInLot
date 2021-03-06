import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';
import 'rxjs/add/operator/take';

@IonicPage()
@Component({
  selector: 'page-co-car',
  templateUrl: 'co-car.html',
})
export class CoCarPage {
  cars = [];
  userData;
  imgName;
  userId = this.authProvider.userId;

  constructor(private afdb:AngularFireDatabase, 
              private authProvider:AuthProvider, 
              public navCtrl: NavController, 
              public navParams: NavParams,
              public toastCtrl: ToastController,
              private alertCtrl: AlertController
            ) {
  }

  ionViewDidLoad() {
      this.retrieveCars();
  }
retrieveCars(){
  this.afdb.list<any>('profile/' + this.userId + '/cars').snapshotChanges().take(1).subscribe(data=>{    
    for(let i = 0; i < data.length; i ++){
      if(data[i].payload.val().isActive == true){
        this.userData = data[i].payload.val();
        this.retrieveImg();
      }else{
        this.cars.push(data[i]);
      }
    }
  })
}
switch(id){
  //change isActive false
  this.afdb.list<any>('profile/' + this.userId + '/cars').snapshotChanges().take(1).subscribe(data=>{    
    for(let i = 0; i < data.length; i ++){
      if(data[i].payload.val().isActive == true){
        this.afdb.list<any>('profile/' + this.userId + '/cars').update(data[i].key,{
          isActive: false
        });
      }else if(data[i].key == id){
        this.afdb.list<any>('profile/' + this.userId + '/cars').update(id,{
          isActive: true
        });
        const toast = this.toastCtrl.create({
          message: 'Successfully switched to ' + data[i].payload.val().carmodel + ': ' + data[i].payload.val().plateNumber,
          duration: 4000
        });
        toast.present();
        this.navCtrl.setRoot("CoHomePage");
      }
    }
    //change data

  });
}


  retrieveImg() {
    firebase.storage().ref().child("images/" + this.userId + "/" + this.userData.carPic).getDownloadURL().then(d => {
      this.imgName = d;
    }).catch((error) => {
      this.showAlert('There was an error in retrieving the image', '');
    });
  }

  showAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }

}
