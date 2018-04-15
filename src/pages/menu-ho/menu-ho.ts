import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav } from 'ionic-angular';

// import { HoHomePage } from '../ho-home/ho-home';
// import { GaragePage } from '../garage/garage';
// import { TransacHistoryPage } from '../transac-history/transac-history';

export interface PageInterface {
  title: string;
  pageName: string;
  tabComponent?: any;
  icon: string;
}

@IonicPage()
@Component({
  selector: 'page-menu-ho',
  templateUrl: 'menu-ho.html',
})
export class MenuHoPage {

  rootPage = "HoHomePage";

  @ViewChild(Nav) nav: Nav;

  pages: PageInterface[] = [
    {title: 'Home', pageName: 'HoHomePage', tabComponent: 'HoHomePage', icon: 'home'},    
    {title: 'Profile', pageName: 'HoprofilePage', tabComponent: 'HoprofilePage', icon: 'contact'},
    {title: 'Garage', pageName: 'HoGaragePage', tabComponent: 'HoGaragePage', icon: 'wine'},
    {title: 'Transactions', pageName: 'HoTransacHistoryPage', tabComponent: 'HoTransacHistoryPage', icon: 'cash'}
  ]

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuHoPage');
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
