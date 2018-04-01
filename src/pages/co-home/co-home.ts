import { Component } from '@angular/core';
import { NavController, LoadingController, ActionSheetController,IonicPage, Platform, AlertController, MenuController } from 'ionic-angular';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireDatabase } from 'angularfire2/database';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

import { ComoredetailsPage } from '../comoredetails/comoredetails';
import { FCM } from '@ionic-native/fcm';
import { RequestProvider } from '../../providers/request/request';
import { AngularFireAuth } from 'angularfire2/auth';
	
declare var FCMPlugin;
	
@IonicPage()
@Component({
	selector: 'page-co-home',
	templateUrl: 'co-home.html'
})

export class CoHomePage {

	public map;
	public marker;
	public directions;
	public hoMarkers;

	//private authProvider:AuthProvider,
	constructor(private afAuth:AngularFireAuth,
		private afdb: AngularFireDatabase, 
		statusBar: StatusBar, 
		splashScreen: SplashScreen,
		private requestProvider: RequestProvider,
		private alertCtrl: AlertController, 
		private fcm: FCM, 
		platform: Platform,
		public actionSheetCtrl: ActionSheetController, 
		private geolocation: Geolocation, 
		public navCtrl: NavController, 
		public loadingCtrl: LoadingController,
		private menuCtrl: MenuController) {
		mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbjcxMTAiLCJhIjoiY2o5cm50cmw3MDE5cjJ4cGM2aWpud2lkMCJ9.dG-9XfpHOuE6FzQdRfa5Og';
		platform.ready().then(() => {
			this.requestProvider.saveToken();	
			this.fcm.onNotification().subscribe(data => {
  
			  if (data.wasTapped) {
				  if (data.status == 'declined') {
					  alert('Your request has been declined.');
				  } else if (data.status == 'accepted') {
					  alert('Your request has been accepted.');
					  this.navCtrl.pop()
					  .then( () => {
						  this.setDest(data.lang, data.latt);
					  });
				  } else {
					  alert('Something went wrong with the request.')
				  }
			  } else {
				  if (data.status == 'declined') {
					  alert('Your request has been declined.');
				  } else if (data.status == 'accepted') {
					  alert('Your request has been accepted.');
					  this.navCtrl.pop()
					  .then( () => {
						  this.setDest(data.lang, data.latt);
					  });
				  } else {
					  alert('Something went wrong with the request.')
				  }
  
			  };
			});
  
			statusBar.styleDefault();
			splashScreen.hide();
		  });

		  menuCtrl.enable(true);

	}

	ionViewDidLoad() {
		this.map = this.initMap();
		this.getCurrentLocation().subscribe(location => {
			this.setDirections(location);		
			this.centerLocation(location);
			this.setMarkers();
		});
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

	setMarkers() {
		
		const arr = [];
		var map = this.map;
		this.afdb.list('location').snapshotChanges().subscribe(data => {
			for (var a = 0; a < data.length; a++) {
				arr.push(data[a]);
			}
			
			const popup = new mapboxgl.Popup();

			for (var i = 0; i < arr.length; i++) {
				popup.setHTML('<h1>Loakan namba wan!</h1>');
				var el = document.createElement('div');
				el.innerHTML = "mapmarker";
				el.id = data[i].key;
				var coords = new mapboxgl.LngLat(data[i].payload.val().lng, data[i].payload.val().lat);
				new mapboxgl.Marker(el, { offset: [-25, -25] })
					.setLngLat(coords)
					.setPopup(popup)
					.addTo(map);
				
				el.addEventListener('click', (e) => {
					var tmp = e.srcElement.id;
					let actionSheet = this.actionSheetCtrl.create({
						title: 'insert name of place here',
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
	

	setDirections(location) {
		this.directions = new MapboxDirections({
			accessToken: mapboxgl.accessToken,
			interactive: false,
			controls: {
				inputs: true,
				profileSwitcher:false,
				instructions: false
			}
		});

		this.map.addControl(this.directions, 'top-left');
	}
	
	setDest(lang, latt){
		this.directions.setDestination(lang + ',' +latt);
		alert(JSON.stringify(this.marker));
		this.marker.remove();
		alert('after remove: ' + JSON.stringify(this.marker));
		var hoMarker = new mapboxgl.LngLat(lang,latt);
		
		this.addMarker(hoMarker);``
	}

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
			this.directions.setOrigin(location.lng + ',' + location.lat);
		} else {
			this.getCurrentLocation().subscribe(currentLocation => {
				this.map.panTo(currentLocation);
				this.marker.remove();
				this.addMarker(currentLocation);
				this.directions.setOrigin(currentLocation.lng + ',' + currentLocation.lat);
			});
		}
	}

	addMarker(location) {
		if (location) {
			var el = document.createElement('div');
			el.className = "carmarker";

			this.marker = new mapboxgl.Marker(el)
				.setLngLat(location)
				.addTo(this.map);
		} else {
			console.log('No coordinates!');
		}
	}
}
