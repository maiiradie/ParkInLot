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
	stop: boolean = true;
	LngLat;
	_watch = this.geolocation.watchPosition();;
	_markers;
	_init;
	_arriving;
	_initParked;
	_parked;
	tempHoID;
	map;
	marker;
	directions;
	tempLocation;
	hoMarkers;
	location;
	role  = "";
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
			});
		} catch (e) {
		}
	}


	ionViewDidLoad() {
		this.map = this.initMap();		
		this.markerListener();
		this.setDirections();
		this.destination();
		this.map.on('load', () => {
			this.location = this.getCurrentLocation().subscribe(location => {
				this.centerLocation(location);
				this.checkOnGoingTransaction();
				});			
		});
	}

	ionViewWillEnter() {
		this.getRole();
	}

	hasTransaction(status:String){
		if(this.tempHoID && status == "arriving"){	
			this.initListener();
	
		}else if(this.tempHoID && status == "parked"){
			this.initParkedListener();	
		}
	}
	async checkOnGoingTransaction(){
		let query = await this.afdb.list('requests/').snapshotChanges().take(1).subscribe(data=>{			
		  for(let i = 0; i < data.length; i++){
			if(data[i].payload.val().arrivingNode){		
				this.afdb.list<any>('requests/' + data[i].key + '/arrivingNode').snapshotChanges().take(1).subscribe(dataProf=>{
					for(let a = 0; a < dataProf.length; a++){
						if(dataProf[a].payload.val().status != "cancelled"){
							if(dataProf[a].payload.val().carowner.coID == this.userId){	
								console.log("arriving")							
								this.tempHoID = data[i].key		
						
								this._markers.unsubscribe();
								this.hasTransaction("arriving");
								this.getTempLocation(this.tempHoID);
								break;
							}
						}
					}

				});		
			}else if(data[i].payload.val().parkedNode){				
				this.afdb.list<any>('requests/' + data[i].key + '/parkedNode').snapshotChanges().take(1).subscribe(dataProf=>{
					if(dataProf[0].payload.val().carowner.coID == this.userId){
						this.afdb.list<any>('requests/' + data[i].key + '/parkedNode').snapshotChanges().take(1).subscribe(dataProf=>{
							for(let a = 0; a < dataProf.length; a++){
								if(dataProf[0].payload.val().carowner.coID == this.userId){
									this.tempHoID = data[i].key									
									this._markers.unsubscribe();
									this.hasTransaction("parked");
									this.getTempLocation(this.tempHoID);
									break;
								}
							}
						});	
					}
				});
			}
				
		  }
		});
	  }
	  async getTempLocation(homeowner){		  		
		  console.log("getTempLocation");
				 	let subs = await this.afdb.object<any>('location/' + homeowner).valueChanges().take(1).subscribe(data => {
						let temp = {
							lng: data.lng,
							lat: data.lat
						}
						console.log(data.lng + " " + data.lat);
						this.addTempHo(temp);	
						this.tempLocation = temp;
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
			  if(data.status == "arriving"){
				 this.navAddress = "Navigate to destination follow blue lines";
			 }else if (data.status == "hoCancelled"){
				 this.navAddress = "Transaction was cancelled";				 
			 }
		});
	}
	async clearTransac(){
		
		let temp1 = await this.afdb.list<any>('requests/' + this.tempHoID + '/arrivingNode').snapshotChanges().take(1).subscribe(data=>{
			for(let i = 0 ; i < data.length; i++){
				if(data[i].payload.val().carowner.coID == this.userId){
					this._arriving.unsubscribe();
					this.afdb.list('requests/' + this.tempHoID + '/arrivingNode').remove(data[i].key);					
					this.returnCap();
					  if(this._arriving){
						this._arriving.unsubscribe();
					}  
				}
			}
		});	

		let temp2 = await this.afdb.list<any>('requests/' + this.tempHoID + '/parkedNode').snapshotChanges().take(1).subscribe(data=>{
			for(let i = 0 ; i < data.length; i++){
				if(data[i].payload.val().carowner.coID == this.userId){
					this.afdb.list('requests/' + this.tempHoID + '/parkedNode').remove(data[i].key);					
					this.returnCap();
					  if(this._arriving){
						this._arriving.unsubscribe();
						}	  
				}
			}
		});
	}
	async returnCap(){
		var tempCap;
		let temp =  await this.afdb.object<any>('requests/' + this.tempHoID ).valueChanges().subscribe(data=>{        
			tempCap = data.available
			temp.unsubscribe();
			tempCap ++;        
			this.afdb.object('requests/' + this.tempHoID ).update({
			  available: tempCap
			}); 

			this.tempHoID = undefined;
			this.removeAllMarker();					  
			this.setMarkers();		
			this.directions.removeRoutes();
			this.markerListener();			
			this.setMarkers();
		  });
	}

	initCancelWholeTransac(){
		let alert = this.alertCtrl.create({
			title: 'Cancel Transaction',
			subTitle: 'Do you want to cancel the transaction?',
			buttons: [
			  {
				text: 'No',
				role: 'no',
				handler: () => {
				}
			  },
			  {
				text: 'Yes',
				handler: () => {
				  this.cancelWholeTransac();
				}
			  }
			]
		  });
		  alert.present();
	}		
	cancelWholeTransac(){
		let query = this.afdb.list<any>('requests/' + this.tempHoID +'/arrivingNode', ref=> ref.orderByChild("carowner")).snapshotChanges().take(1).subscribe(data=>{
			for(let i = 0; i < data.length; i++){
				if(data[i].payload.val().carowner.coID == this.userId){
					this.afdb.list<any>('requests/' + this.tempHoID +'/arrivingNode').update(data[i].key,{
						status: "cancelled"
					});
					if(this._arriving){
						this._arriving.unsubscribe();
					}					
					this.tempHoID = undefined;
					this.removeAllMarker();
					this.setMarkers();		
					this.directions.removeRoutes();
					this.markerListener();
				}
			}
		});
	}
	arrivedTransac(){
		let query = this.afdb.list<any>('requests/' + this.tempHoID +'/arrivingNode', ref=> ref.orderByChild("carowner")).snapshotChanges().take(1).subscribe(data=>{
			for(let i = 0; i < data.length; i++){
				if(data[i].payload.val().carowner.coID == this.userId){
					this.initParkedListener();   
					this._arriving.unsubscribe();       
					
					this.afdb.list('requests/' + this.tempHoID + '/arrivingNode').remove(data[i].key);
					this.afdb.list('requests/' + this.tempHoID + '/parkedNode').push({
						carowner:data[i].payload.val().carowner,
						timeStart: "",
						endTime: "",
						payment: ""
					  });
					  this.navAddress = "You have arrived your destination";				 
				}
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
		console.log("parked listener is runing");
		this._parked = this.afdb.object<any>('requests/' + this.tempHoID + '/parkedNode/' + key).valueChanges().subscribe(data=>{
			if(this._arriving){
				this._arriving.unsubscribe();
			}			
			if(!data.timeStart && !data.endtime && !data.status){
				this.navAddress = "Wait to start Timer";
			}else if(data.timeStart && !data.endTime){	
						                
                var d = new Date(data.timeStart);
                start = d.toLocaleTimeString();
                this.navAddress = "Timer started at: " + start;

			}else if(data.endTime){
				this._parked.unsubscribe();
				var e = new Date(data.endTime);
				end = e.toLocaleTimeString();
				this._parked.unsubscribe();
					let confirm = this.alertCtrl.create({
							title: 'Payment',
					        subTitle: 'Start time: ' + start+ '<br>End time: ' + end + '<br>Amount: P' + data.payment,
					        enableBackdropDismiss: false,
					        buttons: [{
					       	 text: 'Finish',
					         	handler: () => {
						            this.tempHoID = undefined;  
						            this.setMarkers();		
									this.directions.removeRoutes();
									this.markerListener();

									
					            }
					        	},]
					        });
					       confirm.present();
				
			}if(data.status){
				if(data.status == "cancelled"){
					this.navAddress ="Transaction was cancelled"
					this._parked.unsubscribe();
				}
			}
	   });
	}


	ngOnDestroy(){
		if(this._watch){
			this._watch.subscribe().unsubscribe();
		}
		if(this._init){
			this._init.unsubscribe();
		}if(this._arriving){
			this._arriving.unsubscribe();
		}if(this._initParked){
			this._initParked.unsubscribe();
		}if(this._parked){
			this._parked.unsubscribe();
		}if(this.location){
			this.location.unsubscribe();
		}if(this.hoMarkers){
			this.hoMarkers.unsubscribe();
		}
		
	}

	openMenu(evt) {
		if (evt === "coho-Menu") {
			this.menuCtrl.enable(true, 'coho-Menu');
			this.menuCtrl.enable(false, 'Co-Menu');
			this.menuCtrl.enable(false, 'Ho-Menu');
		} else if (evt === "Co-Menu") {
			this.menuCtrl.enable(true, 'Co-Menu');
			this.menuCtrl.enable(false, 'Ho-Menu');
			this.menuCtrl.enable(false, 'coho-Menu');
		}
		this.menuCtrl.toggle();
	}

		getRole() {
		this.afdb.object('profile/' + this.userId).snapshotChanges().take(1).subscribe(data => {
			var x = data.payload.val().role;
			if (x === 1) {
				this.role = "carowner";
			} else if (x === 2) {
				this.role = "homeowner";
			} else if (x  === 3) {
				this.role = "both";
			} else {
				this.role = undefined;
			}
			
		});
		return this.role;
	}

	destination() {
		var geocoder = new MapboxGeocoder({
			accessToken: 'pk.eyJ1IjoicnlhbjcxMTAiLCJhIjoiY2o5cm50cmw3MDE5cjJ4cGM2aWpud2lkMCJ9.dG-9XfpHOuE6FzQdRfa5Og'
		});
		document.getElementById('geocoder').appendChild(geocoder.onAdd(this.map));
	}

	currentMarkers = [];
	setHoMarkers = [];

	async markerListener(){
		this._markers = await this.afdb.list<any>('location/').snapshotChanges().subscribe(data => {
			for (var a = 0; a < data.length; a++) {
				if(data[a].payload.val().status && !data[a].payload.val().establishment){
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
				}else{
					if(data[a].payload.val().status == "offline"){
						console.log('establishment is offline' )						
						if(document.getElementById(data[a].key)){							
							this.removeMarker(data[a].key);
							var el = document.createElement('div');
							el.id = data[a].key;	
							el.className = "closed";	
							
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
								
						}else if(data[a].payload.val().status == "online"){
								//this.removeMarker(data[a].key);
								var el = document.createElement('div');
								el.id = data[a].key;	
								el.className = "estabMarker";	
								
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
	removeAllMarker(){
		let temp = this.afdb.list<any>('location/').snapshotChanges().subscribe(data => {
			for(let i = 0; i < data.length; i++){
				if(document.getElementById(data[i].key)){
					this.removeMarker(data[i].key);
				}
				temp.unsubscribe();
			}
		});
	}
	removeMarker(elementId){
		var element = document.getElementById(elementId);
		element.parentNode.removeChild(element);
	}
	addTempHo(data){
		var el = document.createElement('div');
		el.className = "mapmarker";
		new mapboxgl.Marker(el, { offset: [-25, -25] })
			.setLngLat([data.lng, data.lat])
			.addTo(this.map);
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


					this.removeAllMarker();
					this.removeCarMarker();	

					this._watch.subscribe((data) => {
						this.LngLat = {
							lng: data.coords.longitude,
							lat: data.coords.latitude
						}
						this.removeCarMarker();
						if(this.tempHoID && this.tempLocation){	
							this.removeAllMarker();
							this.removeCarMarker();				
							this.setDestination(this.tempLocation.lng,this.tempLocation.lat);
							this.setOrigin(this.LngLat);
						}else{
							this.markerListener();
							this.directions.removeRoutes();
							this.addCarMarker(this.LngLat);
						}									
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
