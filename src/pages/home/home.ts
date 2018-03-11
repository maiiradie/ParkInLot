import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';

// import { AuthProvider } from '../../providers/auth/auth';
import  MapboxDirections  from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

import { ActionSheetController } from 'ionic-angular';
import { ComoredetailsPage } from '../Comoredetails/Comoredetails';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public map;
  public marker;
  public hoMarkers;

  //private authProvider:AuthProvider,
  constructor(private afs:AngularFireAuth,private afdb:AngularFireDatabase, public actionSheetCtrl: ActionSheetController, private geolocation: Geolocation, public navCtrl: NavController,public loadingCtrl: LoadingController) {
		mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbjcxMTAiLCJhIjoiY2o5cm50cmw3MDE5cjJ4cGM2aWpud2lkMCJ9.dG-9XfpHOuE6FzQdRfa5Og';
	}

  ionViewDidLoad() {
	this.map = this.initMap();

	this.getCurrentLocation().subscribe(location => {
		 this.centerLocation(location);
		 this.setDirections(location);
	});
		// this.setMarkers();
		this.test();
	}

	test(){
		var arr = [];
		var map = this.map;

		this.afdb.list('location').snapshotChanges().subscribe(data => {
			for (var i = 0 ; i < data.length; i++) {
				arr[i] = {
					type: 'FeatureCollection',
					features: [{
					    type: 'Feature',
					    geometry: {
					      type: 'Point',
					      coordinates: [data[i].payload.val().lat, data[i].payload.val().lng]
					    },
					    properties: {
					      title: 'Mapbox',
					      description: 'Washington, D.C.'
					    }					
				}]
				};
			}
				// console.log(arr);
				// console.log(arr[0].features[0].geometry.coordinates);

			

			const popup = new mapboxgl.Popup();	

			for (var i = 0; i < arr.length; i++) {
				popup.setHTML('<h1>Loakan namba wan!</h1>');
				var el = document.createElement('div');
				el.innerHTML = "You are here!";
				
				el.id = 'marker' +i;
				console.log(el.id);
				var coords = new mapboxgl.LngLat(arr[i].features[0].geometry.coordinates[1],arr[i].features[0].geometry.coordinates[0]);
				 new mapboxgl.Marker(el,{offset:[-25,-25]})
				.setLngLat(coords)
				.setPopup(popup)
			  	.addTo(map);	
			


<<<<<<< HEAD
	 	el.addEventListener('click', () => { 
		    let actionSheet = this.actionSheetCtrl.create({
		      title: 'Name of place',
		      buttons: [
		        {
		          text: 'Request',
		          role: 'destructive',
		          handler: () => {
		            console.log('Destructive clicked');
		          }
		        },{
		          text: 'More Details',
		          handler: () => {
		            this.navCtrl.push(ComoredetailsPage);
		          }
		        },{
		          text: 'Cancel',
		          role: 'cancel',
		          handler: () => {
		            console.log('Cancel clicked');
		            popup.remove();
		          }
		        }
		      ]
		    });
		    actionSheet.present();
  			});
		}
	 	// el.addEventListener('click', () => { 
		 //    let actionSheet = this.actionSheetCtrl.create({
		 //      title: 'Name of place',
		 //      buttons: [
		 //        {
		 //          text: 'Request',
		 //          role: 'destructive',
		 //          handler: () => {
		 //            console.log('Destructive clicked');
		 //          }
		 //        },{
		 //          text: 'More Details',
		 //          handler: () => {
		 //            this.navCtrl.push(ComoredetailsPage);
		 //          }
		 //        },{
		 //          text: 'Cancel',
		 //          role: 'cancel',
		 //          handler: () => {
		 //            console.log('Cancel clicked');
		 //            popup.remove();
		 //          }
		 //        }
		 //      ]
		 //    });
		 //    actionSheet.present();
  	  	// });

		});
		
	}

  	setDirections(location){
	const directions = new MapboxDirections({
		accessToken: mapboxgl.accessToken,
		interactive:false
	});

	this.map.addControl(directions, 'top-left');

	directions.setOrigin(location.lng + ','+location.lat);

  }

  initMap(location = new mapboxgl.LngLat(120.5960,16.4023)){

	let map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v10',
	center: location,
	zoom: 5,
  	attributionControl: false,
	});

	return map;
  }

  //returns latlng coordinates
  getCurrentLocation(){

  		let loading = this.loadingCtrl.create({
  			content:'Locating...'
  		});

  		loading.present(loading);

  		let options = {
  			timeout: 10000, 
  			enableHighAccuracy: true
  		};

  		let locationsObs = Observable.create(observable =>{
	  		this.geolocation.getCurrentPosition(options)
	  		.then(resp => {
	  			let lat = resp.coords.latitude;
	  			let lng = resp.coords.longitude;


	  			let location = new mapboxgl.LngLat(lng,lat);

	  			observable.next(location);
	  			loading.dismiss();

	  		}).catch(error => {
	  			console.log('Error getting location', error);
	  			loading.dismiss();
	  		});
  		});

  		return locationsObs;
  }

  centerLocation(location){
  	if (location){
  		this.map.panTo(location);
  		this.addMarker(location);
  	}else{
  		this.getCurrentLocation().subscribe(currentLocation => {
			this.map.panTo(currentLocation);
			this.marker.remove();
			this.addMarker(currentLocation);
  		});
  	}
  }

  addMarker(location){
  	if (location) {
		//1 this.marker = new mapboxgl.Marker(el, {offset:[-25, -25]})
		this.marker = new mapboxgl.Marker()
		.setLngLat(location)
		//2 .setPopup(popup)
		.addTo(this.map);
  	}else{
  		console.log('No coordinates!');
  	}

  	//3MARKER POPUP / MORE DETAILS
	// const popup = new mapboxgl.Popup()
 //    .setHTML('<h1>Loakan namba wan!</h1>');
	
	// var el = document.createElement('div');
	// el.innerHTML = "You are here!";
	// el.id = 'marker';

 //  	el.addEventListener('click', () => { 

	//     let actionSheet = this.actionSheetCtrl.create({
	//       title: 'Name of place',
	//       buttons: [
	//         {
	//           text: 'Request',
	//           role: 'destructive',
	//           handler: () => {
	//             console.log('Destructive clicked');
	//           }
	//         },{
	//           text: 'More Details',
	//           handler: () => {
	//             this.navCtrl.push(ComoredetailsPage);
	//           }
	//         },{
	//           text: 'Cancel',
	//           role: 'cancel',
	//           handler: () => {
	//             console.log('Cancel clicked');
	//             popup.remove();
	//           }
	//         }
	//       ]
	//     });
	//     actionSheet.present();

 //  	}); 
  }
}
