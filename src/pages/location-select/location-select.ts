import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';

//Pages
// import { } from '../../'

//Plugins
import { Geolocation } from '@ionic-native/geolocation';

/**
 * Generated class for the LocationSelectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-location-select',
  templateUrl: 'location-select.html',
})
export class LocationSelectPage {
	map:any;
	geocoder;
	selectedMarker;		//marker of the selected area in gmap
	myMarker;

	coordinates;	//user's area coordinates
	mapSelected:boolean = false;	//hide show prediction lists
	

	searchItem='';
	autocompleteItems = [];	//list of gmap predictions
	nearbyList = [];

	placeDetail;	//details of selected place

	location;

	//Gmap Services
	GoogleAutocomplete;
	placesService;
	directionsService = new google.maps.DirectionsService;
	directionsDisplay = new google.maps.DirectionsRenderer;

	//Observer/Subscriber
	trackGeo;

	@ViewChild('map') mapRef:ElementRef;
  constructor(public navCtrl: NavController, public navParams: NavParams, private geolocation: Geolocation,
  	private zone:NgZone, private view: ViewController, private toastCtrl:ToastController) {

  	this.geocoder = new google.maps.Geocoder;
  	this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
	this.searchItem = '';
	this.autocompleteItems = [];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocationSelectPage');
    this.showMap();
  }
  ionViewWillUnload(){
  	// this.trackGeo.unsubscribe();
  }
	setMapClick(){
		this.map.addListener('click', event =>{
			if(event.placeId){
				this.setLocation(event.latLng, event.placeId);	//get details
			}
			else{
				this.geocoder.geocode({'location': event.latLng}, (results, status) => {
				    if(status === 'OK' && results[0]){
				    	// console.log(results[0]);
				    	this.setLocation(event.latLng, results[0].place_id);
				    }
			  	});
			}
		});
	}
	showMap(){
	  	let mapOptions = {			//map options
				zoom:10,
				mapTypeId:google.maps.MapTypeId.ROADMAP,
				mapTypeControl:false,
				streetViewControl:false,
				fullscreenControl:false
			}
		this.map = new google.maps.Map(this.mapRef.nativeElement, mapOptions);	
		this.placesService = new google.maps.places.PlacesService(this.map);
		this.directionsDisplay.setMap(this.map);

		// this.geolocation.getCurrentPosition().then(pos=>{		//map location
		// 	let location = new google.maps.LatLng(pos.coords.latitude , pos.coords.longitude);
		// 	this.map.setCenter(location);
		// 	this.map.setZoom(15)
		// }).catch(err => console.log(err));

		// this.trackGeo = this.geolocation.watchPosition({enableHighAccuracy: true})
	 //      .subscribe( data => {
  //           this.coordinates = {
  //           	latitude: data.coords.latitude,
  //           	longitude: data.coords.longitude
  //         	}
  //         	this.location = new google.maps.LatLng(coordinates.lat, coordinates.lng);
  //         	if(this.myMarker){
  //         		this.myMarker.setMap(null);
  //         	}
			
		// 	this.myMarker = new google.maps.Marker({
	 //        	position: this.location,
	 //       	 	map: this.map,
	 //      	});
	 //      })
	 //      this.map.setCenter(this.location);
		// 	this.map.setZoom(17);

		let coordinates = {
			lat: 14.642425,
			lng: 120.9785022
		}
		this.location = new google.maps.LatLng(coordinates.lat, coordinates.lng);
		this.map.setCenter(this.location);
		this.map.setZoom(17);
		this.myMarker = new google.maps.Marker({
        	position: this.location,
       	 	map: this.map,
      	});
      	this.setMapClick();
      	// var cityCircle = new google.maps.Circle({
       //      strokeColor: '#FF0000',
       //      strokeOpacity: 0.8,
       //      strokeWeight: .2,
       //      fillColor: '#FF0000',
       //      fillOpacity: 0.35,
       //      map: this.map,
       //      center: this.location,
       //      radius: 500
       //    });
	}

  	updateSearchResults(){
  		this.mapSelected = false;
		if (this.searchItem == '') {
		   	this.autocompleteItems = [];
		    return;
		}

		let placeRequest = {
			input: this.searchItem, 
			location: this.location, 
			radius: 15000
		}
		this.GoogleAutocomplete.getPlacePredictions(placeRequest,
			(predictions, status) => {
		    	this.autocompleteItems = [];
		    	this.zone.run(() => {
		    		if(predictions){
		    			predictions.forEach( prediction => {
		        			this.autocompleteItems.push(prediction);
		        		});
		    		}
		      	});
		    });
	}

	selectSearchResult(item){	
		this.mapSelected = true;	//hide prediction list
		this.searchItem = item.description;		//get full name of location
		if(this.selectedMarker){
			this.selectedMarker.setMap(null);
		}
	  	this.geocoder.geocode({'placeId': item.place_id}, (results, status) => {
		    if(status === 'OK' && results[0]){
		      	this.setLocation(results[0].geometry.location, item.place_id)	//get details
		      	this.map.setCenter(results[0].geometry.location);
		    }
	  	});
	}

	setLocation(position, placeId){
		let request = {
			placeId: placeId,
			fields: ['name', 'formatted_address', 'place_id', 'geometry', 'types']
		};
		this.placesService.getDetails(request, (place, status) => {
			this.placeDetail = {
				latLng: position,
				latitude: position.lat(),
				longitude: position.lng(),
				address: place.formatted_address,
				name: place.name,
				placeId: place.place_id
			}
		});
		if(this.selectedMarker){
			this.selectedMarker.setMap(null);
		}
		this.selectedMarker = new google.maps.Marker({
        	position: position,
       	 	map: this.map
      	});
	}
	goToLocation(){
		this.map.setCenter(this.location);
	}

	selectLocation(){
		this.view.dismiss({location: this.placeDetail});
		if(!this.placeDetail){
			let toast = this.toastCtrl.create({
              message: "No location selected.",
              duration: 1000,
              position: 'bottom',
            });
            toast.present();
		}
	}
	dismiss(){
		this.view.dismiss();
	}
}
