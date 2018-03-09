import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';

// import { AuthProvider } from '../../providers/auth/auth';
import  MapboxDirections  from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

import { ActionSheetController } from 'ionic-angular';
import { ComoredetailsPage } from '../Comoredetails/Comoredetails';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public map;
  public marker;
  public hoMarkers;

  //private authProvider:AuthProvider,
  constructor(public actionSheetCtrl: ActionSheetController, private geolocation: Geolocation, public navCtrl: NavController,public loadingCtrl: LoadingController) {
		mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbjcxMTAiLCJhIjoiY2o5cm50cmw3MDE5cjJ4cGM2aWpud2lkMCJ9.dG-9XfpHOuE6FzQdRfa5Og';
	}

  ionViewDidLoad() {
	this.map = this.initMap();

	this.getCurrentLocation().subscribe(location => {
		 this.centerLocation(location);
		 this.setDirections(location);
	});

		//mock marker
		// this.marker = new mapboxgl.Marker()
		// .setLngLat({lng:120.5960,lat:16.4023})
		// .addTo(this.map);
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
	zoom: 17,
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
