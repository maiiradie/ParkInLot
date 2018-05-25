import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../providers/auth/auth';
import firebase from 'firebase';
import 'rxjs/add/operator/take';

import { Profile } from '../models/profile';
import { LoginPage } from '../pages/login/login';

import { HoHomePage }  from '../pages/ho-home/ho-home';
import { HoprofilePage }  from '../pages/hoprofile/hoprofile';
import { HoGaragePage }  from '../pages/ho-garage/ho-garage';
import { HoTransacHistoryPage }  from '../pages/ho-transac-history/ho-transac-history';

import { CoHomePage } from '../pages/co-home/co-home';
import { CoEditProfilePage } from '../pages/co-edit-profile/co-edit-profile';
import { CoCarPage } from '../pages/co-car/co-car';
import { CoTransacHistoryPage } from '../pages/co-transac-history/co-transac-history';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = "LoginPage";
  @ViewChild(Nav) nav: Nav;

  profileData;
  imgName;
  private userId;
  private loggedIn;

  constructor(private menuCtrl: MenuController,
    private authProvider: AuthProvider,
    private afdb: AngularFireDatabase, 
    private afs: AngularFireAuth,
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
      this.menuCtrl.swipeEnable(false);
      this.retrieveUser();
    });
    //enter code here

    this.afs.auth.onAuthStateChanged(user => {
      if (user) {
        this.authProvider.myId(user.uid);
        console.log(user.uid);
      }else{
        this.rootPage = "LoginPage";
      }
    });
    

  }
  
  openPage(page: string, role){
    if ((page == 'CoHomePage' && role == 'carowner') || (page == 'HoHomePage' && role == 'homeowner'))  {
      this.nav.popToRoot();
    } else if(page == 'HoHomePage' && role == 'both') {
      this.nav.push(page);
    } else if(page == 'CoHomePage' && role == 'both') {
      this.nav.popToRoot();
    } 
    else {
      this.nav.push(page);
    }
  }

  isActive(page: string){
    if (this.nav.getActive() && this.nav.getActive().name === page){
      return 'primary';
    }
  }

  retrieveUser() {
    if (this.authProvider.userId) {
      this.userId = this.authProvider.setID();
      this.afdb.object(`/profile/` + this.userId).valueChanges().take(1).subscribe(data => {
        this.profileData = data;
        this.retrieveImg();
      });
    } else {
      this.profileData = null;
      this.imgName = "./assets/imgs/avatar.jpg";
    }
  }


  openMenu(evt) {
    if (evt === "coho-Menu"){
      // this.menuCtrl.enable(true, 'coho-Menu');
      //  this.menuCtrl.enable(false, 'Co-Menu');
    }else if(evt === "Co-Menu"){
      //  this.menuCtrl.enable(false, 'Ho-Menu');
      //  this.menuCtrl.enable(true, 'Co-Menu');
    } 

    this.menuCtrl.toggle();
  }

  retrieveImg() {
    firebase.storage().ref().child("images/" + this.userId + "/" + this.profileData.profPic).getDownloadURL().then(d => {
      this.imgName = d;
    }).catch((error) => {
      console.log("error in retrieving image: " + JSON.stringify(error));
      this.imgName = "./assets/imgs/avatar.jpg";
    });
 }

  logout(){
    this.authProvider.logoutUser()
      //  .then( () => {
         this.menuCtrl.close()
          this.nav.setRoot('LoginPage');
      //  });
  }

  // logoutHo(){
  //   this.authProvider.logoutUser()
  //   // .then(() => {
  //     this.authProvider.updateHOStatus('offline')
  //      .then( () => {
  //        this.menuCtrl.close();
  //         this.nav.setRoot('LoginPage');
  //      });
  //   // });
  // }

  logoutHo(){
    this.authProvider.logoutUser()
    .then(() => {
      this.authProvider.updateHOStatus('offline');
       this.menuCtrl.close()
       .then( () => {
          this.nav.setRoot('LoginPage');
       });
    });
  }
<<<<<<< HEAD

=======
  
>>>>>>> f2b98416516d16b385fcd1a4867cef251b7b3e85
  logoutHoCo(){
    this.authProvider.logoutUser();
    this.menuCtrl.close();
    this.nav.setRoot('LoginPage');
  }

}