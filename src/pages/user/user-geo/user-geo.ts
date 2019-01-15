import { Component,EventEmitter, ViewChild, ElementRef  } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';
import { UserReportPage } from '../user-report/user-report';
import { UserCheckPage } from '../user-check/user-check';
import { Geolocation } from '@ionic-native/geolocation';
import { google } from 'google-maps';

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

	@ViewChild('map') mapRef:ElementRef;

	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modal: ModalController, private geo:Geolocation) {
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
			let beachMarker = new google.maps.Marker({		//map marker
				position: {lat:pos.coords.latitude, lng:pos.coords.longitude},
				map: this.map,
				size: new google.maps.Size(10, 16)
				//icon: image
			});
		}).catch(err => console.log(err));
		
		var users = [
			['user1', 14.6037159, 120.9630088, 2],
			['user2', 20.6037159, 120.9630088, 1]
		];

		//var image = 'assets/imgs/avatar.jpg';
		
		/*
		for (var i = 0; i < users.length; i++) {
			var user = users[i];
			var marker = new google.maps.Marker({
				position: {lat: user[1], lng: user[2]},
				map: this.map,
				//icon: image,
            	title: user[0],
            	zIndex: user[1]
			});
		  }
		*/
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