import { Component } from '@angular/core';
import { NavController, LoadingController, ActionSheetController, IonicPage, Platform,MenuController } from 'ionic-angular';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

import { ComoredetailsPage } from '../comoredetails/comoredetails';
import { FCM } from '@ionic-native/fcm';
import { RequestProvider } from '../../providers/request/request';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
	selector: 'page-co-home',
	templateUrl: 'co-home.html'
})

export class CoHomePage {

	map;
	marker;
	directions;
	hoMarkers;
	location;
	userId = this.authProvider.userId;

	constructor(private afAuth: AngularFireAuth,
		private afdb: AngularFireDatabase,
		private authProvider:AuthProvider,
		private requestProvider: RequestProvider,
		private fcm: FCM,
		public platform: Platform,
		public actionSheetCtrl: ActionSheetController,
		private geolocation: Geolocation,
		public navCtrl: NavController,
		public loadingCtrl: LoadingController,
		private menuCtrl: MenuController) {
		mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbjcxMTAiLCJhIjoiY2o5cm50cmw3MDE5cjJ4cGM2aWpud2lkMCJ9.dG-9XfpHOuE6FzQdRfa5Og';
		this.afAuth.auth.onAuthStateChanged(user => {
			if (user) {
				this.authProvider.updateStatus('online');
				this.authProvider.updateOnDisconnect();
			}
		});

		this.requestProvider.saveToken();
		this.onNotification();
		menuCtrl.enable(true);
	}

	async onNotification(){
		try {
			await this.platform.ready();

			this.fcm.onNotification().subscribe(data => {

				if (data.wasTapped) {

					if (data.status == 'declined') {
						alert('Your request has been declined.');
					} else if (data.status == 'accepted') {
						alert('Your request has been accepted.');
						this.navCtrl.pop()
							.then(() => {
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
							.then(() => {
								this.setDest(data.lang, data.latt);
							});
					} else {
						alert('Something went wrong with the request.')
					}

				};
			},(error) => {
				console.log(error);
			});

		} catch (e) {
			console.log(e);
		}
	}

	ionViewDidLoad() {
		this.map = this.initMap();
		this.setDirections(null);
	}

	ngOnDestroy(){
		this.location.unsubscribe();
		this.hoMarkers.unsubscribe();
	}

	ionViewDidEnter(){
		this.location = this.getCurrentLocation()
		.subscribe(location => {
			this.centerLocation(location);
			this.setMarkers();
		});
	}

	openMenu(evt) {
		if (evt === "Ho-Menu") {
			this.menuCtrl.enable(true, 'Ho-Menu');
			this.menuCtrl.enable(false, 'Co-Menu');
		} else if (evt === "Co-Menu") {
			this.menuCtrl.enable(false, 'Ho-Menu');
			this.menuCtrl.enable(true, 'Co-Menu');
		}
		this.menuCtrl.toggle();
	}

	setMarkers() {
		var arr = [];
		var map = this.map;

		this.hoMarkers = this.afdb.list('location').snapshotChanges().subscribe(data => {

			for (var a = 0; a < data.length; a++) {
				arr.push(data[a]);
			}

			for (var i = 0; i < arr.length; i++) {

				var el = document.createElement('div');
				// el.innerHTML = "Marker!";
				el.id = data[i].key;
				el.className = "mapmarker";

				var coords = new mapboxgl.LngLat(data[i].payload.val().lng, data[i].payload.val().lat);

				new mapboxgl.Marker(el, { offset: [-25, -25] })
					.setLngLat(coords)
					.addTo(map);

				el.addEventListener('click', (e) => {
					var tmp = e.srcElement.id;
					let actionSheet = this.actionSheetCtrl.create({
						title: '',
						buttons: [
							{
								text: 'More Details',
								handler: () => {
									this.navCtrl.push("ComoredetailsPage", { key: tmp });
								}
							},
							{
								text: 'Cancel',
								role: 'cancel',
								handler: () => {
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
				// inputs: true,
				profileSwitcher: false,
				instructions: false
			}
		});

		this.map.addControl(this.directions, 'top-left');

		// this.directions.setOrigin(location.lng + ',' + location.lat);
	}

	setDest(lang, latt) {
		this.directions.setDestination(lang + ',' + latt);
		this.marker.remove();
		var hoMarker = new mapboxgl.LngLat(lang, latt);

		this.addMarker(hoMarker);
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

	getCurrentLocation() {
		let loading = this.loadingCtrl.create({
			content: 'Locating...'
		});

		let options = {
			// timeout: 100000,
			enableHighAccuracy: true
		};

		loading.present(loading);

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
			this.location = this.getCurrentLocation().subscribe(currentLocation => {
				this.map.panTo(currentLocation);
				this.marker.remove();
				this.addMarker(currentLocation);
			});
		}
	}

	addMarker(location) {
		var el = document.createElement('div');
		el.className = "carmarker";

		this.marker = new mapboxgl.Marker(el)
			.setLngLat(location)
			.addTo(this.map);
	}
}
