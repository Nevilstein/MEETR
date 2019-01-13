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
	@ViewChild('map') mapRef:ElementRef;
	map:any;

	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modal: ModalController, private geo:Geolocation) {
	}

	ionViewDidLoad(){
		console.log(this.mapRef);
		this.showMap();
	}

	showMap(){
		//map location
		this.geo.getCurrentPosition().then(pos=>{
			this.lat = pos.coords.latitude;
			this.lng = pos.coords.longitude;
		}).catch(err => console.log(err));
		let location = new google.maps.LatLng(this.lat , this.lng);
		//let location = new google.maps.LatLng(14.6037159,120.9630088);
		//map options
		let options = {
			center:location,
			zoom:10
		}
		this.map = new google.maps.Map(this.mapRef.nativeElement,options);
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