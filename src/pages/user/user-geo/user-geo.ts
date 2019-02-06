import { Component,EventEmitter, ViewChild, ElementRef  } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController, Platform} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';

//Pages
import { UserReportPage } from '../user-report/user-report';
import { UserCheckPage } from '../user-check/user-check';

//Plugins
import { Geolocation } from '@ionic-native/geolocation';
import { google } from 'google-maps';
import { Subscription } from 'rxjs/Subscription';
import { filter, timeout } from 'rxjs/operators'
import { AngularFireDatabase } from 'angularfire2/database';

//Providers
import { ChatProvider } from '../../../providers/chat/chat';

declare var google:any;


@IonicPage()
@Component({
  selector: 'page-user-geo',
  templateUrl: 'user-geo.html',
})

export class UserGeoPage {
	lat:any;
	lng:any;
	map:any;
	latitude:any;
	longitude:any;
	currentMapTrack = null;
	isTracking = false;
	trackedRoute = [];
	previousTracks = [];
	geoStatus: boolean;

	myMarker;
	matchMarker;

	chatKey: string = this.chatProvider.chatKey;
  	receiverKey: string = this.chatProvider.receiverKey;

  	//Observer/Subscriber
  	positionSubscription:Subscription;
  	locationObserver :Subscription;
  	chatObserver :Subscription;       
	@ViewChild('map') mapRef:ElementRef;

	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modalCtrl: ModalController, 
		private geolocation:Geolocation, private platform:Platform, private db: AngularFireDatabase, 
		private chatProvider: ChatProvider) {
	}

	ionViewDidLoad(){
		this.showMap();
	}

	ionViewWillUnload(){
		this.positionSubscription.unsubscribe();
		this.locationObserver.unsubscribe();
		this.chatObserver.unsubscribe();
	}
	
	
	// JAVASCRIPT GMAPS API----works
	showMap(){
		let mapOptions = {			//map options
			zoom:10,
			mapTypeId:google.maps.MapTypeId.ROADMAP,
			mapTypeControl:false,
			streetViewControl:false,
			fullscreenControl:false
		}
		this.map = new google.maps.Map(this.mapRef.nativeElement, mapOptions);		//MAP INITIALIZATION
		
		this.geolocation.getCurrentPosition().then(pos=>{		//map location
			let location = new google.maps.LatLng(pos.coords.latitude , pos.coords.longitude);
			this.map.setCenter(location);
			this.map.setZoom(15)
		}).catch(err => console.log(err));
		this.startTracking();		//track mainUser
		this.trackMatch();		//track userMatch
	}
	
	
	startTracking(){
		this.isTracking = true;
		this.trackedRoute = [];

		this.positionSubscription = this.geolocation.watchPosition()
		.pipe(
			filter((p) => p.coords !== undefined)
		)
		.subscribe(data => {
			setTimeout(() => {
				this.trackedRoute.push({lat:data.coords.latitude, lng:data.coords.longitude});
				//this.redrawPath(this.trackedRoute); //line draw function called
				//var image = 'assets/imgs/avatar.jpg';
				let Marker1 = new google.maps.Marker({		//map marker
					position: {lat:data.coords.latitude, lng:data.coords.longitude},
					map: this.map,
					size: new google.maps.Size(10, 16),
					center:location
					//icon: image
				});
			});
			this.currentMapTrack.setMap(null);
		})
	}
/*
	redrawPath(path){
		if(this.currentMapTrack){
			this.currentMapTrack.setMap(null);
		}

		if(path.length > 1){ //line drawing on map
			this.currentMapTrack.setMap(null);
			this.currentMapTrack = new google.maps.Polyline({
				path:path,
				geodesic:true,
				strokeColor:'#ff00ff',
				strokeOpacity:1.0,
				strokeWeight:3
			});
			this.currentMapTrack.setMap(this.map);
		}
	}
*/
	trackMatch(){
		this.chatObserver = this.db.list('chat', ref=> ref.child(this.receiverKey).orderByKey().equalTo(this.chatKey))
			.snapshotChanges().subscribe( snapshot => {
				snapshot.forEach( element =>{
					let data = element.payload.val();
					this.geoStatus = data['geoStatus'];
				})
			});
		this.locationObserver = this.db.list('location', ref => ref.orderByKey().equalTo(this.receiverKey))
			.snapshotChanges().subscribe( snapshot =>{
				snapshot.forEach( element => {
					let data = element.payload.val();
					data['id'] = element.key;
					let matchCoordinates = {
						latitude: data['currentLocation'].latitude,
						longitude: data['currentLocation'].longitude
					}
					console.log("match", matchCoordinates);
					this.startTrackingMatch(matchCoordinates)
				});
			});
	}

	/*
	startTrackingMatch(coordinates){
		this.isTracking = true;
		this.trackedRoute = [];
		this.trackedRoute.push({lat:coordinates.latitude, lng:coordinates.longitude});
		this.matchMarker = new google.maps.Marker({		//map marker for match
			position: {lat:coordinates.latitude, lng:coordinates.longitude},
			map: this.map,
			size: new google.maps.Size(10, 16),
		});
		this.matchMarker.setMap(this.map);
	}
	*/

	startTrackingMatch(coordinates){
		this.isTracking = true;
		this.trackedRoute = [];

		this.positionSubscription = this.geolocation.watchPosition()
		.pipe(
			filter((p) => p.coords !== undefined)
		)
		.subscribe(data => {
			setTimeout(() => {
				this.trackedRoute.push({lat:coordinates.latitude, lng:coordinates.latitude});
				let Marker2 = new google.maps.Marker({		//map marker
					position: {lat:coordinates.latitude, lng:coordinates.latitude},
					map: this.map,
					size: new google.maps.Size(10, 16),
				});
			});
		})
	}

	
	/*
	trackMatch(){
		//if geoStatus with match is true
			//get latMatch and lngMatch from db
			//this.startTrackingMatch(latMatch, lngMatch); //track userMatch location
		//else
			//do nothing
		this.chatObserver = this.db.list('chat', ref=> ref.child(this.receiverKey).orderByKey().equalTo(this.chatKey))
			.snapshotChanges().subscribe( snapshot => {
				snapshot.forEach( element =>{
					let data = element.payload.val();
					this.geoStatus = data['geoStatus'];
				})
			});
		this.locationObserver = this.db.list('location', ref => ref.orderByKey().equalTo(this.receiverKey))
			.snapshotChanges().subscribe( snapshot =>{
				snapshot.forEach( element => {
					let data = element.payload.val();
					data['id'] = element.key;
					let matchCoordinates = {
						latitude: data['currentLocation'].latitude,
						longitude: data['currentLocation'].longitude
					}
					console.log("match", matchCoordinates);
					this.startTrackingMatch(matchCoordinates)
				});
			});
	}

	startTrackingMatch(coordinates){
		this.isTracking = true;
		this.trackedRoute = [];
		this.trackedRoute.push({lat:coordinates.latitude, lng:coordinates.longitude});
		// if(this.matchMarker){
		// 	this.matchMarker.setMap(null);
		// }
		this.matchMarker = new google.maps.Marker({		//map marker
			position: {lat:coordinates.latitude, lng:coordinates.longitude},
			map: this.map,
			size: new google.maps.Size(10, 16),
		});
		this.matchMarker.setMap(this.map);
	}

	*/

	// onCardInteract(event){
 //   		console.log(event);
	// }
	// report_user(){
	// 	const report = this.modalCtrl.create(UserReportPage);
	// 	report.present();
	// }	
	// check_user(){
	// 	const check = this.modalCtrl.create(UserCheckPage);
	// 	check.present();
	// }	
}