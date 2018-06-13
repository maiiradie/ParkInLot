import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../providers/auth/auth';
import firebase from 'firebase';
import 'rxjs/add/operator/take';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = "LoginPage";
  @ViewChild(Nav) nav: Nav;

  profileData;
  imgName;

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
    });

    this.afs.auth.onAuthStateChanged(user => {
      if (user) {
        this.afdb.object<any>(`profile/` + user.uid).valueChanges().take(1).subscribe(data => {
          this.profileData = data;
          if (data.homeowner && !data.carowner) {
            this.authProvider.updateLocationLog(user.uid, 'online');
            this.authProvider.updateHOOnDisconnect(user.uid);

            this.authProvider.updateOnDisconnect(user.uid);
            this.authProvider.updateLogStatus(user.uid, 'online');

          } else if (data.carowner && !data.homeowner) {
            this.authProvider.updateLogStatus(user.uid, 'online');
            this.authProvider.updateOnDisconnect(user.uid);
          } else if (data.carowner && data.homeower) {
            this.afdb.object<any>(`location/` + user.uid).valueChanges().take(1).subscribe(data => {
              this.authProvider.updateLogStatus(user.uid, data.payload.val().status);
              this.authProvider.updateHOOnDisconnect(user.uid);

            });
          }
        });

      } else {
        this.profileData = null;
        this.imgName = "./assets/imgs/avatar.jpg";
        this.rootPage = "LoginPage";
      }
    });
  }

  openPage(page: string, role) {
    if ((page == 'CoHomePage' && role == 'carowner') || (page == 'HoHomePage' && role == 'homeowner')) {
      this.nav.popToRoot();
    } else if (page == 'HoHomePage' && role == 'both') {
      this.nav.push(page);
    } else if (page == 'CoHomePage' && role == 'both') {
      this.nav.popToRoot();
    }
    else {
      this.nav.push(page);
    }
  }

  isActive(page: string) {
    if (this.nav.getActive() && this.nav.getActive().name === page) {
      return 'primary';
    }
  }

  retrieveImg(id) {
    firebase.storage().ref().child("images/" + id + "/" + this.profileData.profPic).getDownloadURL().then(d => {
      this.imgName = d;
    }).catch((error) => {
      this.imgName = "./assets/imgs/avatar.jpg";
    });
  }

  logout() {
    this.authProvider.updateLogStatus(this.afs.auth.currentUser.uid, "offline");
    this.authProvider.logoutUser()
      .then(() => {
        this.menuCtrl.close()
          .then(() => {
            this.nav.setRoot('LoginPage');
          })

      })
  }

  logoutHo() {
    this.authProvider.logoutUser()
      .then(() => {
        this.authProvider.updateHOStatus('offline');
        this.menuCtrl.close()
          .then(() => {
            this.nav.setRoot('LoginPage');
          });
      });
  }

  logoutHoCo() {
    this.authProvider.logoutUser();
    this.menuCtrl.close();
    this.nav.setRoot('LoginPage');
  }
}