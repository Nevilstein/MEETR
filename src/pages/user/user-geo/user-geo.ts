import { Component,EventEmitter, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController, Platform, ToastController} from 'ionic-angular';
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
import moment from 'moment';

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
	map:any;
	hasMeetup: boolean;
	isLoading: boolean = true;
	geoStatus = { sender:this.chatProvider.geoStatus , receiver: null }
	distance = { sender: null, receiver: null}
	currentPosition;
	isInactive;
	userActivity;

	//new variables 02/26/19
	activeIndex = -1;
	activeMeetup;

	myMarker;
	matchMarker;
	meetupMarker;
	meetupCircle;
	placesService;
	placeDetails;

	authKey: string = this.authProvider.authUser;
	chatKey: string = this.chatProvider.chatKey;
  	receiverKey: string = this.chatProvider.receiverKey;
  	meetupDetails;
  	requests = [];
  	userProfile = this.chatProvider.userProfile;

  	meetupStatus = this.chatProvider.meetupRequest;

  	//Observer/Subscriber
  	positionSubscription:Subscription;
  	locationObserver :Subscription;
  	chatObserver :Subscription;     
  	meetupObserver :Subscription;     
  	activeObserver;
  	meetupChecker;  
	@ViewChild('map') mapRef:ElementRef;

	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modalCtrl: ModalController, 
		private geolocation:Geolocation, private platform:Platform, private db: AngularFireDatabase, 
		private chatProvider: ChatProvider, private authProvider: AuthProvider, private toastCtrl: ToastController,
		private zone: NgZone ) {
	}

	ionViewDidLoad(){
		if(this.chatProvider.requests.length > 0){
	    	this.requests = this.chatProvider.requests;
	    }
	    this.getActiveMeetup(); 
	    if(this.activeIndex === -1){
	    	this.isLoading = false;
	      	let toast = this.toastCtrl.create({
	          message: "No meetup is available today.",
	          duration: 1000,
	          position: 'top'
	        });
	        toast.present();
	      }
	    else{
	    	this.setMeetupPlace();	//setting meetup place	
	    }
	    this.checkMeetup();
		this.showMap();
		
	}

	ionViewWillUnload(){
		this.positionSubscription.unsubscribe();
		this.locationObserver.unsubscribe();
		this.chatObserver.unsubscribe();
		this.meetupObserver.unsubscribe();
		this.activeObserver.unsubscribe();
		// clearInterval(this.meetupChecker);
	}
	
	checkMeetup(){
		this.meetupObserver = this.db.list('meetups', ref=> ref.child(this.chatKey))
		.snapshotChanges().subscribe( snapshot => {
			let meetupArr = []
	        var meetupPromise = new Promise(resolve =>{
	          snapshot.forEach( (element, index) => {
	              let data = element.payload.val();
	              data['id'] = element.key;
	              meetupArr.push(data);
	          });
	          resolve(true);
	        });
	        meetupPromise.then(() =>{
	          this.requests = meetupArr;
	          this.getActiveMeetup();
	          if(this.activeIndex > -1){
	          	this.setMeetupPlace();	//setting meetup place	
	          }
	          if(this.meetupMarker){
					this.meetupMarker.setMap(null);
					this.meetupCircle.setMap(null);
				}
			});
		});
	}
	
	// JAVASCRIPT GMAPS API----works
	showMap(){
		var image1 = "../../../assets/imgs/marker1.png";
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
			this.currentPosition = {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude
			} 
			if(this.activeIndex > -1){
				let meetupPoint = {
					latitude: this.activeMeetup.location.latitude, 
					longitude: this.activeMeetup.location.longitude
				}
				let distance = geolib.getDistance(this.currentPosition, meetupPoint);
				this.distance.sender = (Math.round(distance/100.0)*100)/1000;	//estimating
			}
			this.map.setCenter(location);
			this.map.setZoom(15);
		}).then(() =>{
			this.myMarker = new google.maps.Marker({
	        	position: location,
	       	 	map: this.map,
	       	 	icon:image1,
	      	});
	      	if(this.activeIndex > -1){
				this.startTracking();
	      	}
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
	
	getActiveMeetup(){
		let dateNow = moment().valueOf();
		let day = 86400000;
		let minutes = 900000;  //15 minutes allowance
		this.activeIndex = this.requests.findIndex(x => !x.isCancelled && x.status==="Ongoing" 
			&& dateNow >= moment(x.date+" "+x.time).valueOf()-day);
			// (dateNow >= moment(x.date+" "+x.time).valueOf()-day) && dateNow < moment(x.date+" "+x.time).valueOf()+minutes);
	    this.activeMeetup = this.requests[this.activeIndex];
	}
	// checkMeetups(){
	// 	this.meetupObserver = this.db.list('meetups', ref=> ref.child(this.chatKey).orderByKey().equalTo(this.meetupDetails.id))
	// 		.snapshotChanges().subscribe( snapshot => {
	// 			let dateNow = moment().valueOf();
	// 			snapshot.forEach( element =>{
	// 				let data = element.payload.val()
	// 				data['id'] = element.key;
	// 				data['isAccepted'] = this.meetupStatus.receiverStatus === 'Accepted' && 
	// 					this.meetupStatus.senderStatus === 'Accepted' ? true : false;
	// 				this.meetupStatus = data;
	// 				let minutes = 1800000;  //30 minutes allowance
	// 				let dateTime = moment(data['date']+" "+data['time']).valueOf()+minutes;
	// 				data['isExpired'] = dateNow > dateTime ? true: false;
	// 				if(!this.meetupStatus.isCancelled && this.meetupStatus.isAccepted && !this.meetupStatus.isExpired){
	// 					this.setMeetupPlace();	//setting meetup place	
	// 					this.hasMeetup = true;
	// 				}
	// 				else{
	// 					this.hasMeetup = false;
	// 					this.isLoading = false;
						// if(this.meetupMarker){
						// 	this.meetupMarker.setMap(null);
						// 	this.meetupCircle.setMap(null);
						// }
	// 					let toast = this.toastCtrl.create({
	// 			          message: "No meetups available.",
	// 			          duration: 1000,
	// 			          position: 'top'
	// 			        });
	// 			        toast.present();
	// 				}
	// 			});
	// 		});
	// }

	setMeetupPlace(){
		var latLng = new google.maps.LatLng(this.activeMeetup.location.latitude, this.activeMeetup.location.longitude)
		var image = "../../../assets/imgs/markerfinal.png";
		this.placesService = new google.maps.places.PlacesService(this.map);
	    let request =  {
			placeId: this.activeMeetup.placeId,
			fields: ['name', 'formatted_address', 'place_id', 'geometry', 'types']
		};
		this.placesService.getDetails(request, (place, status) => {
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
	       	 	//icon:image,
	       	 	map: this.map,
      		});
      		this.meetupCircle = new google.maps.Circle({
	            center: this.placeDetails.latLng,
	            radius: 1200,
	            strokeColor: "",
	            strokeOpacity: 0.0,
	            strokeWeight: 2,
	            fillColor: "#33A7FF",
	            fillOpacity: 0.3,
	            map: this.map
	        });
	        //track userMatch
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
		var image1 = "../../../assets/imgs/marker1.png";
		this.positionSubscription = this.geolocation.watchPosition({enableHighAccuracy: true})
		.pipe(
			filter((p) => p.coords !== undefined)
		)
		.subscribe(data => {
			let userPoint = {
				latitude: data.coords.latitude,
				longitude: data.coords.longitude
			}
			if(this.currentPosition.latitude !== userPoint.latitude && this.currentPosition.longitude !== userPoint.longitude){
				this.zone.run(() => {
					if(this.myMarker){
						this.myMarker.setMap(null);
					}
					this.myMarker = new google.maps.Marker({		//map marker
						position: {lat:data.coords.latitude, lng:data.coords.longitude},
						map: this.map,
						size: new google.maps.Size(10, 16),
						center:location,
						icon: image1,
					});		
				});
				this.currentPosition = {
					latitude: data.coords.latitude,
					longitude: data.coords.longitude
				} 
			}

			if(this.activeIndex > -1){
				let meetPoint = {
					latitude: this.placeDetails.latitude,
					longitude: this.placeDetails.longitude
				}

				let distance = geolib.getDistance(this.currentPosition, meetPoint) //auth user distance
				this.distance.sender = (Math.round(distance/100.0)*100)/1000;	//estimating

				let userInCircle = geolib.isPointInCircle(userPoint,meetPoint,20);
				if(userInCircle){
					if(this.activeMeetup.hasArrived[this.receiverKey]){
						this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.activeMeetup.id+"/hasArrived",{
							[this.authKey]: true,
							status: 'Success'
						});
					}
					else{
						this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.activeMeetup.id+"/hasArrived",{
							[this.authKey]: true
						});
					}
				}
			}
			this.isLoading = false;
		})
	}
	trackMatch(){
		this.chatObserver = this.db.list('chat', ref=> ref.child(this.receiverKey).orderByKey().equalTo(this.chatKey))
			.snapshotChanges().subscribe( snapshot => {
				snapshot.forEach( element =>{
					let data = element.payload.val();
					this.geoStatus.receiver = data['geoStatus'];
				})
			});
		this.activeObserver = this.db.list('activity', ref=> ref.orderByKey().equalTo(this.receiverKey))
			.snapshotChanges().subscribe( snapshot => {
				snapshot.forEach( element =>{
					let data = element.payload.val();
					this.userActivity = data['isActive'];
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
					this.startTrackingMatch(matchCoordinates);
				});
			});
	}
	startTrackingMatch(coordinates){
		if(this.matchMarker){
			this.matchMarker.setMap(null);
		}
		var image2 = "../../../assets/imgs/marker2.png";
		let userPoint = {
			latitude: coordinates.latitude,
			longitude: coordinates.longitude
		}
		let meetPoint = {
			latitude: this.placeDetails.latitude,
			longitude: this.placeDetails.longitude
		}

		let distance = geolib.getDistance(userPoint, meetPoint) //distance of other user 
		this.distance.receiver = (Math.round(distance/100.0)*100)/1000	//estimating
		let isInCircle = geolib.isPointInCircle(userPoint,meetPoint,1200);	//condition if in radius of location
		let timePassed = moment().valueOf() - this.userActivity.timestamp;
		this.isInactive = (!this.userActivity.status && (timePassed > 300000))? true : false

		if(this.geoStatus.receiver && isInCircle && this.userActivity.status && !this.isInactive){
			this.zone.run(() => {
				this.matchMarker = new google.maps.Marker({		//map marker
					position: {lat:coordinates.latitude, lng:coordinates.longitude},
					map: this.map,
					icon:image2,
					size: new google.maps.Size(10, 16),
				});
			});
		}
	}	
}