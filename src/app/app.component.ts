import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
// import { LoginPage } from '../pages/login/login';
// import { CoregisterPage } from '../pages/coregister/coregister';
// import { HoregisterPage } from '../pages/horegister/horegister';
// import { ProfilePage } from '../pages/profile/profile';
import { AuthProvider } from '../providers/auth/auth'; 

import { HoHomePage }  from '../pages/ho-home/ho-home';
import { HoprofilePage }  from '../pages/hoprofile/hoprofile';
import { HoGaragePage }  from '../pages/ho-garage/ho-garage';
import { HoTransacHistoryPage }  from '../pages/ho-transac-history/ho-transac-history';

import { CoHomePage } from '../pages/co-home/co-home';
import { CoEditProfilePage } from '../pages/co-edit-profile/co-edit-profile';
import { CoCarPage } from '../pages/co-car/co-car';
import { CoTransacHistoryPage } from '../pages/co-transac-history/co-transac-history';

// import { EditProfilePage } from '../pages/edit-profile/edit-profile';
// import { GaragePage } from '../pages/garage/garage';
// import { TransacHistoryPage } from '../pages/transac-history/transac-history';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = "LoginPage";
  // rootPage: any = "MenuPage";
  @ViewChild(Nav) nav: Nav;
  constructor(private menuCtrl: MenuController, private authProvider: AuthProvider, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  // this.pages = [
  //     {title: 'Profile', component: ProfilePage }
  //   ]
  // }

  // openPage(page){
  //   this.nav.push(page.component);
  // }

  // logout(){
  //   this.authProvider.logoutUser()
  //   .then(() => {
  //      this.menuCtrl.close()
  //      .then( () => {
  //         this.nav.setRoot(LoginPage);
  //      });

  //   });
  }

  
  
  openPage(page: string){
    this.nav.setRoot(page);
  }

  isActive(page: string){
    if (this.nav.getActive() && this.nav.getActive().name === page){
      return 'primary';
    }
  }

  openMenu(evt) {
    if(evt === "Ho-Menu"){
       this.menuCtrl.enable(true, 'Ho-Menu');
       this.menuCtrl.enable(false, 'Co-Menu');
    }else if(evt === "Co-Menu"){
       this.menuCtrl.enable(false, 'Ho-Menu');
       this.menuCtrl.enable(true, 'Co-Menu');
    }
    this.menuCtrl.toggle();
  }
}

