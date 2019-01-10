import { Component,EventEmitter  } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';
import { UserReportPage } from '../user-report/user-report';
import { UserCheckPage } from '../user-check/user-check';
import { Geolocation } from '@ionic-native/geolocation';

/**
 * Generated class for the UserHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-geo',
  templateUrl: 'user-geo.html',
})
export class UserGeoPage {
	lat:any;
	lng:any;

	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modal: ModalController, private geo:Geolocation) {


	}

	ionViewDidLoad(){
		this.geo.getCurrentPosition().then(pos=>{
			this.lat = pos.coords.latitude;
			this.lng = pos.coords.longitude;
		}).catch(err => console.log(err));
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