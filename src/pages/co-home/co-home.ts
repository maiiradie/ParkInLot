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
	_watchTrans
	_markers;
	_init;
	_arriving;
	_initParked;
	_parked;
	tempHoID;
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
		//this.onNotification();
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
		this.checkOnGoingTransaction();

		
		//initialize map
		this.map = this.initMap();		
		this.markerListener();
		this.setDirections();
		this.destination();
		this.map.on('load', () => {
			this.location = this.getCurrentLocation().subscribe(location => {
				this.centerLocation(location);
				if (this.tempHoID) {
					this.removeCarMarker();
					this.afdb.object<any>('location/' + this.tempHoID).valueChanges().take(1)
					.subscribe( data => {							
						this._watchTrans = this.geolocation.watchPosition();
						var temp = data
						this._watchTrans.subscribe((data) => {
							let LngLat = {
								lng: data.coords.longitude,
								lat: data.coords.latitude
							}							
							this.setDestination(temp.lng,temp.lat);				
							this.setOrigin(LngLat);	
						});
						


					});
				}
				});			
			});
	}

	hasTransaction(status:String){
		if(this.tempHoID && status == "arriving"){	
			this.initListener();
			//marker setup
	
		}else if(this.tempHoID && status == "parked"){
			this.initParkedListener();	
		}
	}
	async checkOnGoingTransaction(){
		let query = await this.afdb.list('requests/').snapshotChanges().take(1).subscribe(data=>{			
		  for(let i = 0; i < data.length; i++){
			if(data[i].payload.val().arrivingNode){		
				this.afdb.list<any>('requests/' + data[i].key + '/arrivingNode').snapshotChanges().take(1).subscribe(dataProf=>{
					if(dataProf[0].payload.val().carowner.coID == this.userId){
						this.tempHoID = data[i].key	
						this._markers.unsubscribe();
						this.hasTransaction("arriving");
					}
				});		
			}else if(data[i].payload.val().parkedNode){				
				this.afdb.list<any>('requests/' + data[i].key + '/parkedNode').snapshotChanges().take(1).subscribe(dataProf=>{
					if(dataProf[0].payload.val().carowner.coID == this.userId){
						this.afdb.list<any>('requests/' + data[i].key + '/parkedNode').snapshotChanges().take(1).subscribe(dataProf=>{
							if(dataProf[0].payload.val().carowner.coID == this.userId){
								this.tempHoID = data[i].key
								this._markers.unsubscribe();
								this.hasTransaction("parked");
							}
						});	
					}
				});
			}
				
		  }
		});
	  }

	initListener(){
		var key;
		var start;
		var end;
		this._init = this.afdb.list<any>('requests/' + this.tempHoID + '/arrivingNode').snapshotChanges().subscribe(data=>{		
			for(var i = 0; i < data.length; i++){				
				if(data[i].payload.val().carowner.coID == this.userId){					
					key = data[i].key;
					this.arrivingListener(key);
					this._init.unsubscribe();
				  }
			}
		});
	}

	arrivingListener(key){
		this._arriving= this.afdb.object<any>('requests/' + this.tempHoID + '/arrivingNode/' + key).valueChanges().subscribe(data=>{
			 if(data.status == "arrived"){
				 this.navAddress = "You have arrived your destination";
				 this._arriving.unsubscribe();
				 this.initParkedListener();          
			 }else if(data.status == "arriving"){
				 this.navAddress = "Navigate to destination follow blue lines";
			 }
		});
	}

	initParkedListener(){
		var key;
		this._initParked = this.afdb.list<any>('requests/' + this.tempHoID + '/parkedNode').snapshotChanges().subscribe(data=>{
			for(var i = 0; i < data.length; i++){	
				if(data[i].payload.val().carowner.coID == this.userId){					
					key = data[i].key;					
					this._initParked.unsubscribe();
					this.parkedListener(key);
				}
			}
		});	
	}

	parkedListener(key){
		var start;
		var end
		this._parked = this.afdb.object<any>('requests/' + this.tempHoID + '/parkedNode/' + key).valueChanges().subscribe(data=>{
			if(!data.timeStart && !data.endtime){
				this.navAddress = "You have arrived your destination";
			}else if(data.timeStart && !data.endTime){			                
                var d = new Date(data.timeStart);
                start = d.toLocaleTimeString();
                this.navAddress = "Timer started at: " + start;

			}else if(data.endTime){
				this._parked.unsubscribe();
				var e = new Date(data.endTime);
				end = e.toLocaleTimeString();
				this._parked.unsubscribe();
				//alert controller
					let confirm = this.alertCtrl.create({
							title: 'Payment',
					        subTitle: 'Start time: ' + start+ '<br>End time: ' + end + '<br>Amount: P' + data.payment,
					        enableBackdropDismiss: false,
					        buttons: [{
					       	 text: 'Finish',
					         	handler: () => {
									//navigator.geolocation.clearWatch(this._watchTrans);
						            this.tempHoID = undefined;  
						            this.setMarkers();		
									this.directions.removeRoutes();
									this.markerListener();

									
					            }
					        	},]
					        });
					       confirm.present();
				
			}
	   });
	}


	ngOnDestroy(){
		if(this._init){
			this._init.unsubscribe();
		}if(this._arriving){
			this._arriving.unsubscribe();
		}if(this._initParked){
			this._initParked.unsubscribe();
		}if(this._parked){
			this._parked.unsubscribe();
		}if(this.location){
			this.location.unsubscribe
		}if(this.hoMarkers){
			this.hoMarkers.unsubscribe();
		}
		
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

	markerListener(){
		this._markers = this.afdb.list<any>('location/').snapshotChanges().subscribe(data => {
			for (var a = 0; a < data.length; a++) {
				if(data[a].payload.val().status){
					if(data[a].payload.val().status == "offline"){
						if(document.getElementById(data[a].key)){
							this.removeMarker(data[a].key);
						}
					}else if(data[a].payload.val().status == "online"){
						var el = document.createElement('div');
						el.id = data[a].key;

				if (data[a].payload.val().establishment) {
					el.className = "estabMarker";
				}else{
					el.className = "mapmarker";
				}
				
				var coords = new mapboxgl.LngLat(data[a].payload.val().lng, data[a].payload.val().lat);

				this.setHoMarkers[a] = new mapboxgl.Marker(el, { offset: [-25, -25] })
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
				}
			}

		});
	}
	removeMarker(elementId){
		var element = document.getElementById(elementId);
		element.parentNode.removeChild(element);
	}
	setMarkers() {
		var arr = [];
		// var map = this.map;
		var markers = [];
		if (this.tempHoID) {
			//remove markers
			for (var i = 0; i < this.setHoMarkers.length - 1; i++) {
				this.setHoMarkers[i].remove();
			}

			this.afdb.object<any>('location/' + this.tempHoID).valueChanges().take(1)
			.subscribe(data => {
				var el = document.createElement('div');
				el.className = "mapmarker";
				new mapboxgl.Marker(el, { offset: [-25, -25] })
					.setLngLat([data.lng, data.lat])
					.addTo(this.map);
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
				instructions: false,
			},
			geocoder: {
				flyTo: false
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

					let watch = this.geolocation.watchPosition();
					watch.subscribe((data) => {
						let LngLat = {
							lng: data.coords.longitude,
							lat: data.coords.latitude
						}
						this.removeCarMarker();
						this.addCarMarker(LngLat);
						
					});

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
	removeCarMarker(){
		this.marker.remove();
	}
	addCarMarker(location){
		console.log("con");
		var el = document.createElement('div');
		el.className = "carmarker";

		this.marker = new mapboxgl.Marker(el)
			.setLngLat(location)
			.remove()
			.addTo(this.map);
	}
	addMarker(location) {

		var el = document.createElement('div');

		el.className = "carmarker";

		this.marker = new mapboxgl.Marker(el)
			.setLngLat(location)
			.addTo(this.map);

	}

}
