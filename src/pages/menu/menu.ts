import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav } from 'ionic-angular';

import { AuthProvider } from '../../providers/auth/auth';

import { Profile } from '../../models/profile';

export interface PageInterface {
  title: string;
  pageName: string;
  // tabComponent?: any;
  icon: string;
}


@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  // rootPage = "HoHomePage";
 
  @ViewChild(Nav) nav: Nav;


  pages: PageInterface[] = []
  // = [
  //   {title: 'Home', pageName: 'HoHomePage', icon: 'home'},    
  //   {title: 'Profile', pageName: 'HoEditProfilePage', icon: 'contact'},
  //   {title: 'Garage', pageName: 'HoGaragePage', icon: 'wine'},
  //   {title: 'Transactions', pageName: 'HoTransacHistoryPage', icon: 'cash'}
  // ]

  

  constructor(public navCtrl: NavController, public navParams: NavParams, private authProvider: AuthProvider) {
    // this.authProvider.getUser()
    // .subscribe(role => {
    //   if (role.carowner) {
    //     this.navCtrl.setRoot("HomePage");
    //   }else{
    //     this.navCtrl.setRoot("HomehoPage");
    //   }

    this.authProvider.getUser()
    .subscribe(role => {
      if(role.carowner){
          this.nav.setRoot("CoHomePage");
          this.pages = [
            {title: 'Home',pageName: 'CoHomePage', icon: 'home' },
            {title: 'Profile',pageName: 'CoEditProfilePage', icon: 'contact' },
            {title: 'Car',pageName: 'CoCarPage', icon: 'car' },
            {title: 'Transaction',pageName: 'CoTransacHistoryPage', icon: 'cash' }
          ];
        }else if(role.homeowner){
          this.nav.setRoot("HoHomePage");
          this.pages = [
            {title: 'Home', pageName: 'HoHomePage', icon: 'home'},    
            {title: 'Profile', pageName: 'HoprofilePage', icon: 'contact'},
            {title: 'Garage', pageName: 'HoGaragePage', icon: 'wine'},
            {title: 'Transactions', pageName: 'HoTransacHistoryPage', icon: 'cash'}
          ];
        } else if(role.homeowner){
          this.nav.setRoot("EstablishmentPage");
        }
      })


  }
  ionViewDidLoad() {
    console.log("this is Menu Page");
  }


  openPage(page: PageInterface){
    this.nav.setRoot(page.pageName);
  }

  isActive(page: PageInterface){
    // let childNav = this.nav.getActiveChildNav();

    // if (childNav){
    //   if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent){
    //     return 'primary';
    //   }
    //   return;
    // }

    if (this.nav.getActive() && this.nav.getActive().name === page.pageName){
      return 'primary';
    }
  }
}
