import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav } from 'ionic-angular';

export interface PageInterface {
  title: string;
  pageName: string;
  tabComponent?: any;
  icon: string;
}

@IonicPage()
@Component({
  selector: 'page-menu-co',
  templateUrl: 'menu-co.html',
})
export class MenuCoPage {

  rootPage = "CoHomePage";

  @ViewChild(Nav) nav: Nav;

  pages: PageInterface[] = [
    {title: 'Home',pageName: 'CoHomePage', tabComponent: 'CoHomePage', icon: 'home' },
    {title: 'Profile',pageName: 'CoEditProfilePage', tabComponent: 'CoEditProfilePage', icon: 'contact' },
    {title: 'Car',pageName: 'CoCarPage', tabComponent: 'CoCarPage', icon: 'car' },
    {title: 'Transaction',pageName: 'CoTransacHistoryPage', tabComponent: 'CoTransacHistoryPage', icon: 'cash' }
  ]

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuCoPage');
  }

  openPage(page: PageInterface){
    this.nav.setRoot(page.pageName);
  }

  isActive(page: PageInterface){
    if (this.nav.getActive() && this.nav.getActive().name === page.pageName){
      return 'primary';
    }
  }

}
