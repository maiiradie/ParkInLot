import { Component,ViewChild } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';
//for testing
import { HomePage } from '../pages/home/home';

import { AuthProvider } from '../providers/auth/auth'; 

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav:Nav

  // rootPage:any = LoginPage;
  rootPage:any = HomePage;

  pages: Array<{title: string, component:any}>;

  constructor(private menuCtrl:MenuController,private authProvider:AuthProvider, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    this.pages = [
      {title: 'Profile', component: ProfilePage }
    ]
  }

  openPage(page){
    this.nav.push(page.component);
  }

  logout(){
    this.authProvider.logoutUser()
    .then(() => {
       this.menuCtrl.close()
       .then( () => {
          this.nav.setRoot(LoginPage);
       });

    });
  }
}

