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
import geolib from 'geolib';

//Providers
import { ChatProvider } from '../../../providers/chat/chat';
import { AuthProvider } from '../../../providers/auth/auth';

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
	meetupMarker;
	placesService;
	placeDetails;

	authKey: string = this.authProvider.authUser;
	chatKey: string = this.chatProvider.chatKey;
  	receiverKey: string = this.chatProvider.receiverKey;
  	meetupDetails = this.chatProvider.meetupRequest;
  	userProfile = this.chatProvider.userProfile;

  	meetupStatus;

  	//Observer/Subscriber
  	positionSubscription:Subscription;
  	locationObserver :Subscription;
  	chatObserver :Subscription;     
  	meetupObserver :Subscription;     
  	meetupChecker;  
	@ViewChild('map') mapRef:ElementRef;

	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modalCtrl: ModalController, 
		private geolocation:Geolocation, private platform:Platform, private db: AngularFireDatabase, 
		private chatProvider: ChatProvider, private authProvider: AuthProvider) {
	}

	ionViewDidLoad(){
		this.showMap();
	}

	ionViewWillUnload(){
		this.positionSubscription.unsubscribe();
		this.locationObserver.unsubscribe();
		this.chatObserver.unsubscribe();
		this.meetupObserver.unsubscribe();
		// clearInterval(this.meetupChecker);
	}
	
	
	// JAVASCRIPT GMAPS API----works
	showMap(){
		let mapOptions = {			//map options
			zoom:10,
			mapTypeId:google.maps.MapTypeId.ROADMAP,
			mapTypeControl:false,
			streetViewControl:false,
		}
		this.map = new google.maps.Map(this.mapRef.nativeElement, mapOptions);		//MAP INITIALIZATION
		var location
		this.geolocation.getCurrentPosition().then( pos=> {		//map location
			location = new google.maps.LatLng(pos.coords.latitude , pos.coords.longitude);
			this.map.setCenter(location);
			this.map.setZoom(15);
		}).then(() =>{
			this.myMarker = new google.maps.Marker({
	        	position: location,
	       	 	map: this.map,
	      	});
			this.setMeetupPlace();	//setting meetup place
			this.startTracking();		//track mainUser
			this.trackMatch();		//track userMatch
		}).catch(err => console.log(err));
		// let coordinates = {
		// 	lat: 14.642425,
		// 	lng: 120.9785022
		// }
		// var location = new google.maps.LatLng(coordinates.lat, coordinates.lng);
		// this.map.setCenter(location);
		// this.map.setZoom(15);
		// this.myMarker = new google.maps.Marker({
  //       	position: location,
  //      	 	map: this.map,
  //     	});
		// this.setMeetupPlace();	//setting meetup place
		// this.checkMeetups();
		// this.startTracking();		//track mainUser
		
	}
	
	checkMeetups(){
		this.db.list('meetups', ref=> ref.child(this.chatKey).orderByKey().equalTo(this.meetupDetails.id))
			.snapshotChanges().subscribe( snapshot => {
				snapshot.forEach( element =>{
					let data = element.payload.val()
					data['id'] = element.key;
					this.meetupStatus = data;
					
				});
			});
	}

	setMeetupPlace(){
		var latLng = new google.maps.LatLng(this.meetupDetails.location.latitude, this.meetupDetails.location.longitude)
		this.placesService = new google.maps.places.PlacesService(this.map);
	    let request =  {
			placeId: this.meetupDetails.placeId,
			fields: ['name', 'formatted_address', 'place_id', 'geometry', 'types']
		};
		this.placesService.getDetails(request, (place, status) => {
			console.log(place);
			this.placeDetails = {
				latLng: place.geometry.location,
				latitude: place.geometry.location.lat(),
				longitude: place.geometry.location.lng(),
				address: place.formatted_address,
				name: place.name,
				placeId: place.place_id
			}
			this.meetupMarker = new google.maps.Marker({
	        	position: this.placeDetails.latLng,
	       	 	map: this.map,
      		});
      		new google.maps.Circle({
	            center: this.placeDetails.latLng,
	            radius: 1500,
	            strokeColor: "",
	            strokeOpacity: 0.0,
	            strokeWeight: 2,
	            fillColor: "#FFD700",
	            fillOpacity: 0.5,
	            map: this.map
	        });
	        this.trackMatch();
      	});
      	
	    // var newCircle = new google.maps.Marker({
	    //     icon: whiteCircle,
	    //     position: latLng
	    // });
	    // newCircle.setMap(this.map);

	    // let isInRange = geolib.isPointInCircle(
		   //  otherPoint,myPoint,
		   //  this.myProfile['maxDistance']*1000);
		// this.meetupChecker = setInterval(() =>{

		// });
	}
	
	startTracking(){
		this.isTracking = true;
		this.trackedRoute = [];

		this.positionSubscription = this.geolocation.watchPosition()
		.pipe(
			filter((p) => p.coords !== undefined)
		)
		.subscribe(data => {
			this.trackedRoute.push({lat:data.coords.latitude, lng:data.coords.longitude});
			//this.redrawPath(this.trackedRoute); //line draw function called
			//var image = 'assets/imgs/marker1.jpg';
			if(this.myMarker){
				this.myMarker.setMap(null);
			}
			this.myMarker = new google.maps.Marker({		//map marker
				position: {lat:data.coords.latitude, lng:data.coords.longitude},
				map: this.map,
				size: new google.maps.Size(10, 16),
				center:location
				//icon: image
			});
			let userPoint = {
				latitude: data.coords.latitude,
				longitude: data.coords.longitude
			}
			let meetPoint = {
				latitude: this.placeDetails.latitude,
				longitude: this.placeDetails.longitude
			}
			let userInCircle = geolib.isPointInCircle(userPoint,meetPoint,20);
			if(userInCircle){
				this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.meetupDetails.id+"/hasArrived",{
					[this.authKey]: true
				});
			}
			// this.currentMapTrack.setMap(null);
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
	startTrackingMatch(coordinates){
		this.isTracking = true;
		this.trackedRoute = [];
		this.trackedRoute.push({lat:coordinates.latitude, lng:coordinates.longitude});
		if(this.matchMarker){
			this.matchMarker.setMap(null);
		}
		let userPoint = {
			latitude: coordinates.latitude,
			longitude: coordinates.longitude
		}
		let meetPoint = {
			latitude: this.placeDetails.latitude,
			longitude: this.placeDetails.longitude
		}
		let isInCircle = geolib.isPointInCircle(userPoint,meetPoint,1500);
		if(this.geoStatus && isInCircle){
			this.matchMarker = new google.maps.Marker({		//map marker
				position: {lat:coordinates.latitude, lng:coordinates.longitude},
				map: this.map,
				size: new google.maps.Size(10, 16),
			});
		}
	}	
}