import { Component,EventEmitter, ViewChild, ElementRef  } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController, Platform} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';
import { UserReportPage } from '../user-report/user-report';
import { UserCheckPage } from '../user-check/user-check';
import { Geolocation } from '@ionic-native/geolocation';
import { google } from 'google-maps';
import { Subscription } from 'rxjs/Subscription';
import { filter } from 'rxjs/operators'

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
	positionSubscription:Subscription;


	@ViewChild('map') mapRef:ElementRef;

	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modal: ModalController, private geo:Geolocation, private plt:Platform) {
	}

	ionViewDidLoad(){
		this.showMap();
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
		
		this.geo.getCurrentPosition().then(pos=>{		//map location
			let location = new google.maps.LatLng(pos.coords.latitude , pos.coords.longitude);
			this.map.setCenter(location);
			this.map.setZoom(15)
		}).catch(err => console.log(err));
		this.startTracking();		//track mainUser
		//this.trackMatch();		//track userMatch
	}
	
	
	startTracking(){
		this.isTracking = true;
		this.trackedRoute = [];

		this.positionSubscription = this.geo.watchPosition()
		.pipe(
			filter((p) => p.coords !== undefined)
		)
		.subscribe(data => {
			setTimeout(() => {
				this.trackedRoute.push({lat:data.coords.latitude, lng:data.coords.longitude});
				this.redrawPath(this.trackedRoute); //line draw function called
				//var image = 'assets/imgs/avatar.jpg';
				let Marker = new google.maps.Marker({		//map marker
					position: {lat:data.coords.latitude, lng:data.coords.longitude},
					map: this.map,
					size: new google.maps.Size(10, 16),
					center:location
					//icon: image
				});
			});
		})
	}

	redrawPath(path){
		if(this.currentMapTrack){
			this.currentMapTrack.setMap(null);
		}

		if(path.length > 1){ //line drawing on map
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

	startTrackingMatch(latMat, lngMat){
		this.isTracking = true;
		this.trackedRoute = [];

		this.positionSubscription = this.geo.watchPosition()
		.pipe(
			filter((p) => p.coords !== undefined)
		)
		.subscribe(data => {
			setTimeout(() => {
				this.trackedRoute.push({lat:latMat, lng:lngMat});
				let Marker = new google.maps.Marker({		//map marker
					position: {lat:latMat, lng:lngMat},
					map: this.map,
					size: new google.maps.Size(10, 16),
				});
			});
		})
	}

	trackMatch(){
		//if geoStatus with match is true
			//get latMatch and lngMatch from db
			//this.startTrackingMatch(latMatch, lngMatch); //track userMatch location
		//else
			//do nothing
	}

	onCardInteract(event){
   		console.log(event);
	}
	report_user(){
		const report = this.modal.create(UserReportPage);
		report.present();
	}	
	check_user(){
		const check = this.modal.create(UserCheckPage);
		check.present();
	}	
}