import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, NavParams, ActionSheetController, IonicPage, Platform, MenuController } from 'ionic-angular';
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
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

@IonicPage()
@Component({
	selector: 'page-co-home',
	templateUrl: 'co-home.html'
})

export class CoHomePage {
	reqListenerSub;
	testing;
	map;
	marker;
	directions;
	hoMarkers;
	location;
	userId = this.authProvider.userId;
	navAddress;
	constructor(private afAuth: AngularFireAuth,
		public alertCtrl: AlertController,
		public navParams: NavParams,
		private afdb: AngularFireDatabase,
		private authProvider: AuthProvider,
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
		//this.requestProvider.saveToken();
		// this.onNotification();
		menuCtrl.enable(true);
	}

	async onNotification() {
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
								this.setDestination(data.lang, data.latt);
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
								this.setDestination(data.lang, data.latt);
							});
					} else {
						alert('Something went wrong with the request.')
					}

				};
			}, (error) => {
				console.log(error);
			});

		} catch (e) {
			console.log(e);
		}
	}


	ionViewDidLoad() {
		this.testing = this.navParams.get('key');

		this.map = this.initMap();
		this.setMarkers();
		this.setDirections();
		this.destination();

		this.map.on('load', () => {
			this.location = this.getCurrentLocation()
			.subscribe(location => {
				this.centerLocation(location);
					if (this.testing) {
						this.requestNodeListener();
						this.afdb.object<any>('location/' + this.testing).valueChanges().take(1)
						.subscribe( data => {
								this.setOrigin(location);
								this.setDestination(data.lng,data.lat);					
						});
					}				
				});			
			});
	}

	requestNodeListener(){
		var start;
		var end;
		this.reqListenerSub = this.afdb.object<any>('requests/' + this.testing).valueChanges().take(4).subscribe(data => {
			if (data.motionStatus) {
				console.log(data.motionStatus);
				if (data.motionStatus == "arriving") {
					this.navAddress = "Please navigate";
				} else if (data.motionStatus == "parked") {
					this.navAddress = "You have arrived";
				}
			} if (data.endTime) {
				let secTemp = this.afdb.object<any>('requests/' + this.testing).valueChanges().subscribe(data => {
					var s = new Date(data.startTime);
					start = s.toLocaleTimeString();
					var e = new Date(data.endTime);
					end = e.toLocaleTimeString();
					let confirm = this.alertCtrl.create({
						title: 'Payment',
						subTitle: 'Start time: ' + start + '<br>End time: ' + end + '<br>Amount: P' + data.payment,
						enableBackdropDismiss: false,
						buttons: [{
						  text: 'Finish',
						  handler: () => {
							this.testing = undefined;	
							this.directions.removeRoutes();
							this.setMarkers();
						  }
						},]
					});
					confirm.present();
					console.log("this is unsubscribed");
					secTemp.unsubscribe();
				});
			} if (data.startTime) {

				var d = new Date(data.startTime);
				start = d.toLocaleTimeString();
				this.navAddress = "Timer started at: " + start;
			}
		});
	}

	ngOnDestroy() {
		this.location.unsubscribe();
		this.hoMarkers.unsubscribe();
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

	destination() {
		var geocoder = new MapboxGeocoder({
			accessToken: 'pk.eyJ1IjoicnlhbjcxMTAiLCJhIjoiY2o5cm50cmw3MDE5cjJ4cGM2aWpud2lkMCJ9.dG-9XfpHOuE6FzQdRfa5Og'
		});
		document.getElementById('geocoder').appendChild(geocoder.onAdd(this.map));
	}

	currentMarkers = [];
	setHoMarkers = [];

	setMarkers() {
		var arr = [];
		var markers = [];

		if (this.testing) {
			//remove markers
			for (var i = 0; i < this.setHoMarkers.length - 1; i++) {
				this.setHoMarkers[i].remove();
			}

			this.afdb.object<any>('location/' + this.testing).valueChanges().take(1)
			.subscribe(data => {
				var el = document.createElement('div');
				el.className = "mapmarker";
				new mapboxgl.Marker(el, { offset: [-25, -25] })
					.setLngLat([data.lng, data.lat])
					.addTo(this.map);
			});

		}else {
		this.hoMarkers = this.afdb.list('location').snapshotChanges().subscribe(data => {

			for (var a = 0; a < data.length-1; a++) {
				arr.push(data[a]);
			}

			for (var i = 0; i < arr.length-1; i++) {

				var el = document.createElement('div');
				el.id = arr[i].key;

				if (arr[i].payload.val().establishment) {
					el.className = "estabMarker";
				}else{
					el.className = "mapmarker";
				}
				
				var coords = new mapboxgl.LngLat(arr[i].payload.val().lng, arr[i].payload.val().lat);

				this.setHoMarkers[i] = new mapboxgl.Marker(el, { offset: [-25, -25] })
					.setLngLat(coords)
					.addTo(this.map);

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
	}

	setDirections() {
		this.directions = new MapboxDirections({
			accessToken: mapboxgl.accessToken,
			interactive: false,
			controls: {
				inputs: false,
				profileSwitcher: false,
				instructions: false
			}
		});
		this.map.addControl(this.directions, 'top-left');
	}

	setOrigin(location){
		this.directions.setOrigin(location.lng + ',' + location.lat);
	}


	setDestination(lang, latt) {
		this.directions.setDestination(lang + ',' + latt);
	}

	initMap(location = new mapboxgl.LngLat(120.5960, 16.4023)) {

		let map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v10',
			center: location,
			zoom: 14,
			attributionControl: false,
		});
		
		return map;
	}

	getCurrentLocation() {
		let loading = this.loadingCtrl.create({
			content: 'Locating...'
		});

		let options = {
			timeout: 20000,
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
					alert('Error getting location, please try again');
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
