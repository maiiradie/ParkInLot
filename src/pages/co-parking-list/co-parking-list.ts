import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Events } from 'ionic-angular';

/**
 * Generated class for the CoParkingListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-co-parking-list',
  templateUrl: 'co-parking-list.html',
})
export class CoParkingListPage {

  constructor(public events: Events, private afdb:AngularFireDatabase,public navCtrl: NavController, public navParams: NavParams) {
  }

  listOfHO;
  onlineHO = [];

  ionViewDidLoad() {
    this.listOnlineHO();
  }


  listOnlineHO(){
      this.listOfHO =	this.afdb.list<any>('location', ref => ref.orderByChild('status').equalTo('online'))
      .snapshotChanges().subscribe( data => {
        this.onlineHO = [];

			for (let i = 0; i < data.length; i++) {
        this.onlineHO[i] = data[i].payload.val();
      }
		});
  }

  ngOnDestroy(){
    if (this.listOfHO) {
      this.listOfHO.unsubscribe();
    }
  }

  flyToHO(lat,lng){	
    var location = {
      lat :lat,
      lng:lng
    };

    this.navCtrl.pop().then( () => {
        this.events.publish('location',location);
    });
	}
}
