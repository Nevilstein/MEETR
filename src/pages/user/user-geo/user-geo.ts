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
import { P } from '@angular/core/src/render3';

declare var google: any;


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
			//var image = 'assets/imgs/avatar.jpg';
			let Marker = new google.maps.Marker({		//map marker
				position: {lat:pos.coords.latitude, lng:pos.coords.longitude},
				map: this.map,
				size: new google.maps.Size(10, 16)
				//icon: image
			});
		}).catch(err => console.log(err));
	}
	
	startTracking(){
		this.isTracking = true;
		this.trackedRoute = [];

		this.positionSubscription = this.geo.watchPosition()
		.pipe(
			filter(p => p.coords !== undefined)
		)
		.subscribe(data => {
			setTimeout(() => {
				this.trackedRoute.push({lat:data.coords.latitude, lng:data.coords.longitude});
				this.redrawPath(this.trackedRoute);
			});
		})
	}

	redrawPath(path){
		if(this.currentMapTrack){
			this.currentMapTrack.setMap(null);
		}

		if(path.length > 1){
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