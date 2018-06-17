import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';

export interface PageInterface {
  title: string;
  pageName: string;
  icon: string;
}


@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
 
  @ViewChild(Nav) nav: Nav;


  pages: PageInterface[] = []

  

  constructor(public navCtrl: NavController, public navParams: NavParams, private authProvider: AuthProvider) {

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
