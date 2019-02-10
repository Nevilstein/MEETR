import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';

//Providers
import { AuthProvider } from '../../providers/auth/auth';
import { ChatProvider } from '../../providers/chat/chat';
/**
 * Generated class for the LocationRequestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-location-request',
  templateUrl: 'location-request.html',
})
export class LocationRequestPage {
	authKey = this.authProvider.authUser;
	chatKey = this.chatProvider.chatKey;
	receiverKey = this.chatProvider.receiverKey;
	meetupDetails = this.chatProvider.meetupRequest;

	placeDetails: any;
	coordinates: any;
	isExpired:boolean;

	map:any;
	formMarker;
	@ViewChild('map') mapRef: ElementRef;

	placesService;

	//Observer/Subscription
	trackGeo;
  constructor(public navCtrl: NavController, public navParams: NavParams, private chatProvider: ChatProvider, 
  	private authProvider: AuthProvider, private geolocation: Geolocation, private db: AngularFireDatabase,
  	private view: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocationRequestPage');
    console.log(this.meetupDetails);
    this.trackLocation();
    this.showMap();
  }

  ionViewWillUnload(){
  	// this.trackGeo.unsubscribe()
  }

  showMap(){
  	let mapOptions = {      //map options
        zoom:10,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        mapTypeControl:false,
        streetViewControl:false,
        fullscreenControl:false,
      }

    this.map = new google.maps.Map(this.mapRef.nativeElement, mapOptions);
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
			this.map.setCenter(this.placeDetails.latLng);
      this.map.setZoom(17);
      this.formMarker = new google.maps.Marker({
          position: this.placeDetails.latLng,
          map: this.map,
      });
	      // let latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
		})
		
  }

  trackLocation(){
  	// this.trackGeo = this.geolocation.watchPosition({enableHighAccuracy: true})
   //    .subscribe( data => {
   //    	this.coordinates = {
   //    		lat: data.coords.latitude,
   //    		lng: data.coords.longitude
   //    	}
   //    })
  }

  acceptRequest(){
  	this.db.list('userMeetups', ref=> ref.child(this.authKey)).update(this.meetupDetails.id, {
  		receiverStatus: 'Accepted',
  		action:{
          method: 'accept',
          actor: this.authKey,
          isShown: true
        }
  	})
  	this.db.list('userMeetups', ref=> ref.child(this.receiverKey)).update(this.meetupDetails.id, {
  		receiverStatus: 'Accepted',
  		action:{
          method: 'accept',
          actor: this.authKey,
          isShown: false
        }
  	});
  	this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.meetupDetails.id, {
  		receiverStatus: 'Accepted'
  	});
  }

  declineRequest(){
  	this.db.list('userMeetups', ref=> ref.child(this.authKey)).update(this.meetupDetails.id, {
  		receiverStatus: 'Declined',
  		action:{
          method: 'decline',
          actor: this.authKey,
          isShown: true
        }
  	});
  	this.db.list('userMeetups', ref=> ref.child(this.authKey)).update(this.meetupDetails.id, {
  		receiverStatus: 'Declined',
  		action:{
          method: 'decline',
          actor: this.authKey,
          isShown: false
        }
  	});
  	this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.meetupDetails.id, {
  		receiverStatus: 'Declined'
  	});
  }

  cancelMeetup(){
  	this.db.list('userMeetups', ref=> ref.child(this.authKey)).update(this.meetupDetails.id,{
  		isCancelled: true,
  		action:{
          method: 'cancel',
          actor: this.authKey,
          isShown: true
        }
  	});
  	this.db.list('userMeetups', ref=> ref.child(this.receiverKey)).update(this.meetupDetails.id,{
  		isCancelled: true,
  		action:{
          method: 'cancel',
          actor: this.authKey,
          isShown: false
        }
  	});
  	this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.meetupDetails.id,{
  		isCancelled: true
  	});
  	this.view.dismiss();
  }

}
