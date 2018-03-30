import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';

import { AuthProvider } from '../../providers/auth/auth';
/**
 * Generated class for the HoTransacHistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ho-transac-history',
  templateUrl: 'ho-transac-history.html',
})
export class HoTransacHistoryPage {

  userId = this.authProvider.setID();
  transacData: Array<any> = [];
  profData: Array<any> = [];
  

  constructor(public navCtrl: NavController, public navParams: NavParams, private afdb: AngularFireDatabase, private authProvider: AuthProvider) {
    this.afdb.list('transac').snapshotChanges().subscribe(data => {
      data.forEach(element => {
        console.log("hey");
        if(element.payload.val().ho == this.userId){
          this.transacData.push(element);
          console.log(element.payload.val());
          
        console.log("heyy");
        // this.profSearch(`${element.payload.val().co}`);
          
          this.afdb.object(`profile/${element.payload.val().co}`).valueChanges().subscribe( prof => {
            console.log("heyyy");
              // prof.forEach(profElement => {
                this.profData.push(prof);
              console.log(prof);
                
              // })
        
          });

        }
      });
    });

  

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HoTransacHistoryPage');

  }


  profSearch(id: string){
    // this.afdb.list(`profile/${id}`).snapshotChanges().subscribe( data => {
    //   data.forEach(element => {
    //   this.profData.push(element.payload.val());
        
    //   })
    // });
  }

}
