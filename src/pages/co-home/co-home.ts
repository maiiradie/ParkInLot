import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, LoadingController, NavParams, ActionSheetController, IonicPage, Platform, MenuController } from 'ionic-angular';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFireAuth } from 'angularfire2/auth';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';


@IonicPage()
@Component({
	selector: 'page-co-home',
	templateUrl: 'co-home.html'
})

export class CoHomePage {
	LngLat;
	_watch;
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
	asyncLoader;
	role  = "";
	userId = this.authProvider.userId;
	navAddress;
	transacting;
	activeCar;

	constructor(private afs: AngularFireAuth,		
		private toastCtrl: ToastController,   
		public alertCtrl: AlertController,
		public navParams: NavParams,
		private afdb: AngularFireDatabase,
		private authProvider: AuthProvider,
		public platform: Platform,
		public actionSheetCtrl: ActionSheetController,
		private geolocation: Geolocation,
		public navCtrl: NavController,
		public loadingCtrl: LoadingController,
		private menuCtrl: MenuController) {
		mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbjcxMTAiLCJhIjoiY2o5cm50cmw3MDE5cjJ4cGM2aWpud2lkMCJ9.dG-9XfpHOuE6FzQdRfa5Og';
		menuCtrl.enable(true);						

		let temp = this.afdb.object<any>('profile/' + this.afs.auth.currentUser.uid).snapshotChanges().subscribe(data=>{
				this.transacting = data.payload.val().isTransacting;
					if(data.payload.val().reg_status == "disabled" && data.payload.val().isTransacting == false){
						temp.unsubscribe();
						let toast = this.toastCtrl.create({
							message: 'Account has been disabled',
							duration: 4000,
							position: 'top'
						  });
						  toast.present();
						  
						this.afs.auth.signOut();
						this.navCtrl.setRoot('LoginPage');

					}
		});

	}
	isNotTransacting(){
		console.log("is not transacting");
		this.afdb.object('profile/' + this.userId).update({
		  isTransacting: false
		});
	  }

	transactionListener(){
		let temp = this.afdb.object<any>('profile/' + this.userId).valueChanges().subscribe(data=>{
			if(data.isTransacting == true){
				this.checkOnGoingTransaction();
			}else{

			}
		})
	}
	
	ionViewDidLoad() {
		this.map = this.initMap();
		this.map.on('load', () => {		
			this.setDirections();
			this.destination();	

			 this.location = this.getCurrentLocation().take(1).subscribe(location => {
				 this.initMarkers();
				 this.centerLocation(this.LngLat);

				setTimeout(()=> {	
					const watch = this.geolocation.watchPosition()
					.filter((p) => p.coords !== undefined)
					.subscribe(position=>{
					
					
					let temp = {
						lng: position.coords.longitude,
						lat: position.coords.latitude
					}
					
							this.removeCarMarker();
							this.addCarMarker(temp);	
								if(this.tempHoID){
									this.removeAllMarker();
									if(this.tempLocation){
										this.setDestination(this.tempLocation);
										this.setOrigin(temp);
									}	

								}else if(!this.tempHoID){
									this.initMarkers();
								}					
									this.removeCarMarker();
									this.addCarMarker(temp);													
						});	

					
					});			
				 },this.transactionListener());
				 
		});
		this.getActiveCar();
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

	_activeCar;

	getActiveCar(){
		this._activeCar = this.afdb.list<any>('profile/' + this.authProvider.userId + '/cars', ref => ref.orderByChild('isActive').equalTo(true))
		.snapshotChanges().subscribe( data => {
			for (let i = 0; i < data.length; i++) {
				// console.log(JSON.stringify(data[i].payload.val()));
				this.activeCar = data[i].payload.val().carmodel + ': ' + data[i].payload.val().platenumber;
			}
			this._activeCar.unsubscribe();
		});
	}

	 checkOnGoingTransaction(){		 
		let query =  this.afdb.list('requests/').snapshotChanges().take(1).subscribe(data=>{						
		  for(let i = 0; i < data.length; i++){
			if(data[i].payload.val().arrivingNode){		
				this.afdb.list<any>('requests/' + data[i].key + '/arrivingNode').snapshotChanges().take(1).subscribe(dataProf=>{
					for(let a = 0; a < dataProf.length; a++){
						if(dataProf[a].payload.val().status != "cancelled"){
							if(dataProf[a].payload.val().carowner.coID == this.userId){	
								console.log("arriving")							
								this.tempHoID = data[i].key	
								this.removeAllMarker();	
								//this._markers.unsubscribe();
								this.hasTransaction("arriving");							
								this.getTempLocation(this.tempHoID);																
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
									this.removeAllMarker();							
									//this._markers.unsubscribe();
									this.hasTransaction("parked");									
									this.getTempLocation(this.tempHoID);
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
		console.log('2');
		let subs = await this.afdb.object<any>('location/' + homeowner).valueChanges().take(1).subscribe(data => {
			let temp = {
				lng: data.lng,
				lat: data.lat
			};							
			this.tempLocation = temp;			
			this.addTempHo(temp);
		});
	  }
	initMarkers(){
		this.setHomeownerMarker();
		this.setEstablishmentMarker();
		
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
		this.isNotTransacting();
		let temp1 = await this.afdb.list<any>('requests/' + this.tempHoID + '/arrivingNode').snapshotChanges().take(1).subscribe(data=>{
			for(let i = 0 ; i < data.length; i++){
				if(data[i].payload.val().carowner.coID == this.userId){	
									
					this.afdb.list('requests/' + this.tempHoID + '/arrivingNode').remove(data[i].key);					
					  if(this._arriving){
						this._arriving.unsubscribe();
					}					
					this.tempHoID = undefined;  
					this.directions.removeRoutes();					
				}
			}
		});	

		let temp2 = await this.afdb.list<any>('requests/' + this.tempHoID + '/parkedNode').snapshotChanges().take(1).subscribe(data=>{
			for(let i = 0 ; i < data.length; i++){
				if(data[i].payload.val().carowner.coID == this.userId){
					this.afdb.list('requests/' + this.tempHoID + '/parkedNode').remove(data[i].key);					
					  if(this._arriving){
						this._arriving.unsubscribe();
						}
						this.tempHoID = undefined;
						this.directions.removeRoutes();	  
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
			this.directions.removeRoutes();			
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
					this.returnCap();				
					this.navAddress = undefined;		
					this.directions.removeRoutes();
					this.initMarkers();
					this.isNotTransacting();
					
					
									
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
                start = d.toLocaleTimeString([],{hour12:true});
                this.navAddress = "Timer started at: " + start;

			}else if(data.endTime){
				this._parked.unsubscribe();
				var e = new Date(data.endTime);
				end = e.toLocaleTimeString([],{hour12:true});
				this._parked.unsubscribe();
					let confirm = this.alertCtrl.create({
							title: 'Payment',
					        subTitle: 'Start time: ' + start+ '<br>End time: ' + end + '<br>Amount: P' + data.payment,
					        enableBackdropDismiss: false,
					        buttons: [{
					       	 text: 'Finish',
					         	handler: () => {
						            this.tempHoID = undefined;  	
									this.directions.removeRoutes();								
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
		if(this.listOfHO){
			this.listOfHO.unsubscribe();
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
			accessToken: 'pk.eyJ1IjoicnlhbjcxMTAiLCJhIjoiY2o5cm50cmw3MDE5cjJ4cGM2aWpud2lkMCJ9.dG-9XfpHOuE6FzQdRfa5Og',
			country: 'ph',
		});
		document.getElementById('geocoder').appendChild(geocoder.onAdd(this.map));
	}

	async setHomeownerMarker(){
		await this.afdb.list<any>('location/').snapshotChanges().subscribe(data=>{
			for(var i = 0; i < data.length; i ++){
				if(data[i].payload.val().status == "online"){
					var el = document.createElement('div');
					el.id = data[i].key;	
					el.className = "mapmarker";
					var coords = new mapboxgl.LngLat(data[i].payload.val().lng, data[i].payload.val().lat);
					new mapboxgl.Marker(el, { offset: [-25, -25] })
					.setLngLat(coords)
					.addTo(this.map);

					el.addEventListener('click', (e) => {
					var tmp = e.srcElement.id;
					let actionSheet = this.actionSheetCtrl.create({
						title: '',
						buttons: [
							{
								text: 'Request',
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
				else if(data[i].payload.val().status == "offline"){
						this.removeMarker(data[i].key);
				}
			}
		});
	}
	listOfHO;

	showHO(){
	this.listOfHO =	this.afdb.list<any>('location', ref => ref.orderByChild('status').equalTo('online')).snapshotChanges().subscribe( data => {
			for (let i = 0; i < data.length; i++) {
				console.log(JSON.stringify(data[i].payload.val()));
			}
		});
	}

	flyToHO(){
		this.map.flyTo({
			center: [
				120.5960,
				16.4023
			]
		});	
	}
	setEstablishmentMarker(){
		this.afdb.list<any>('establishments/').snapshotChanges().subscribe(data=>{
			for(var i = 0; i < data.length; i ++){
				this.removeMarker(data[i].key);
				var el = document.createElement('div');
				el.id = data[i].key;	
				if(data[i].payload.val().status == "online"){
					el.className = "estabMarker";
				}else if (data[i].payload.val().status == "offline"){
					el.className = "closed";
				}				
					var coords = new mapboxgl.LngLat(data[i].payload.val().lng, data[i].payload.val().lat);
					new mapboxgl.Marker(el, { offset: [-25, -25] })
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

	removeAllMarker(){
		this.removeEstablishmentMarkers();
		this.removeHomeOwnerMarkers();
	}

	removeEstablishmentMarkers(){
		let temp = this.afdb.list<any>('location/').snapshotChanges().subscribe(data => {
			for(let i = 0; i < data.length; i++){
				this.removeMarker(data[i].key);
				temp.unsubscribe();
			}
		});
	}

	removeHomeOwnerMarkers(){
		let temp = this.afdb.list<any>('establishments/').snapshotChanges().subscribe(data => {
			for(let i = 0; i < data.length; i++){
				this.removeMarker(data[i].key);
				temp.unsubscribe();
			}
		});
	}

	removeMarker(elementId){
		if(document.getElementById(elementId)){
			var element = document.getElementById(elementId);
			element.parentNode.removeChild(element);
		}
	}

	addTempHo(data){
		var el = document.createElement('div');
		el.className = "mapmarker";
		new mapboxgl.Marker(el, { offset: [-25, -25] })
			.setLngLat([data.lng, data.lat])
			.addTo(this.map);
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


	setDestination(location) {
		this.directions.setDestination(location.lng + ',' + location.lat);
	}

	initMap(location = new mapboxgl.LngLat(120.5960, 16.4023)) {

		let map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v10',
			center: location,
			minZoom:7,
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
					if(error.code == 1) {
						alert('Error in getting location. Please allow the application to access your location.');
					} else if (error.code == 2 || error.code == 3 ) {
						alert('Error in getting location. Please try restarting the application.')
					} else {
						alert('Error in getting location. Please try restarting the application.')
					}
					loading.dismiss();
				});
		});
		return locationsObs;
	}

	centerLocation(location) {
		if (location) {
			this.map.setZoom(10);
			this.map.panTo(location);
		} else {
			this.map.setZoom(15);
			this.location = this.getCurrentLocation().subscribe(currentLocation => {
				this.map.panTo(currentLocation);
			});
		}
	}
	removeCarMarker(){
		if(this.marker){
			this.marker.remove();
		}
		
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
