import { Component } from '@angular/core';
import { NavController, LoadingController, ActionSheetController,IonicPage } from 'ionic-angular';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';

import { AngularFireDatabase } from 'angularfire2/database';
//import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { ComoredetailsPage } from '../comoredetails/comoredetails';
// import { AuthProvider } from '../../providers/auth/auth';
@IonicPage()
@Component({
	selector: 'page-co-home',
	templateUrl: 'co-home.html'
})

export class CoHomePage {

	public map;
	public marker;
	public hoMarkers;

	//private authProvider:AuthProvider,
	constructor(private afdb: AngularFireDatabase, public actionSheetCtrl: ActionSheetController, private geolocation: Geolocation, public navCtrl: NavController, public loadingCtrl: LoadingController) {
		mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbjcxMTAiLCJhIjoiY2o5cm50cmw3MDE5cjJ4cGM2aWpud2lkMCJ9.dG-9XfpHOuE6FzQdRfa5Og';
	}

	ionViewDidLoad() {
		this.map = this.initMap();
		// this.getCurrentLocation().subscribe(location => {
		// 	this.centerLocation(location);
		// 	//this.setDirections(location);		
		// });
		this.setMarkers();
	}

	setMarkers() {
		
		var arr = [];
		var map = this.map;
		this.afdb.list('location').snapshotChanges().subscribe(data => {
			for (var a = 0; a < data.length; a++) {
				arr.push(data[a]);
			}
			
			const popup = new mapboxgl.Popup();

			for (var i = 0; i < arr.length; i++) {
				popup.setHTML('<h1>Loakan namba wan!</h1>');
				var el = document.createElement('div');
				el.innerHTML = "You are here!";
				el.id = data[i].key;
				var coords = new mapboxgl.LngLat(data[i].payload.val().lng, data[i].payload.val().lat);
				new mapboxgl.Marker(el, { offset: [-25, -25] })
					.setLngLat(coords)
					.setPopup(popup)
					.addTo(map);
				
				el.addEventListener('click', (e) => {
					var tmp = e.srcElement.id;
					let actionSheet = this.actionSheetCtrl.create({
						title: 'Name of place',
						buttons: [

							{
								text: 'Request',
								role: 'destructive',
								handler: () => {
								console.log('Destructive clicked');
									
								}
							}, {
								text: 'More Details',
								handler: () => {
									this.navCtrl.push(ComoredetailsPage,{key: tmp})
									.then( () => {
										popup.remove();		
									})
									
								}
							}, {
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
		});

	}

	// setDirections(location) {
	// 	const directions = new MapboxDirections({
	// 		accessToken: mapboxgl.accessToken,
	// 		interactive: false,
	// 		controls: {
	// 			inputs: true,
	// 			profileSwitcher:false,
	// 			instructions: false
	// 		}
	// 	});

	// 	this.map.addControl(directions, 'top-left');

	// 	directions.setOrigin(location.lng + ',' + location.lat);

	// }

	initMap(location = new mapboxgl.LngLat(120.5960, 16.4023)) {

		let map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v10',
			center: location,
			zoom: 16,
			attributionControl: false,
		});

		return map;
	}

	//returns latlng coordinates
	getCurrentLocation() {

		let loading = this.loadingCtrl.create({
			content: 'Locating...'
		});

		loading.present(loading);

		let options = {
			// timeout: 100000,
			enableHighAccuracy: true
		};

		let locationsObs = Observable.create(observable => {
			this.geolocation.getCurrentPosition(options)
				.then(resp => {
					let lat = resp.coords.latitude;
					let lng = resp.coords.longitude;


					let location = new mapboxgl.LngLat(lng, lat);

					observable.next(location);
					loading.dismiss();

				}).catch(error => {
					console.log('Error getting location', error);
					loading.dismiss();
				});
		});

		return locationsObs;
	}

	centerLocation(location) {
		if (location) {
			this.map.panTo(location);
			this.addMarker(location);
		} else {
			this.getCurrentLocation().subscribe(currentLocation => {
				this.map.panTo(currentLocation);
				this.marker.remove();
				this.addMarker(currentLocation);
			});
		}
	}

	addMarker(location) {
		if (location) {
			this.marker = new mapboxgl.Marker()
				.setLngLat(location)
				.addTo(this.map);
		} else {
			console.log('No coordinates!');
		}
	}
}
