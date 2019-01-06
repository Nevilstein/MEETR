
import { Component,EventEmitter  } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';
import { UserReportPage } from '../user-report/user-report';
import { UserCheckPage } from '../user-check/user-check';

/**
 * Generated class for the UserHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-home',
  templateUrl: 'user-home.html',
})
export class UserHomePage {
	ready = false;
	attendants = [];
	cardDirection = "xy";
	cardOverlay: any = {
	  like: {
	      backgroundColor: '#28e93b'
	  },
	  dislike: {
	      backgroundColor: '#e92828'
	  }
	};

	images=["../assets/imgs/luwelle.jpg",
	"../assets/imgs/seth.jpg",
	"../assets/imgs/harvey.jpg",
	"https://scontent-sin6-2.xx.fbcdn.net/v/t1.0-9/19894652_469936850037440_3697170092416408084_n.jpg?_nc_cat=105&_nc_eui2=AeFZ9SX__38g7N3a86mgAvHnFV1SXHJO0yi2xAtzTNEkY2ItNLjPRs20Kz9Km1MeTXgy3vndCdepG3bF1dnG4BzbCrAn9xXO9RnIs6UTh4tx9g&_nc_ht=scontent-sin6-2.xx&oh=0e8d22170b7b40f809cea4e365ffcb8e&oe=5CD5D6DC",
	"https://scontent-sin6-2.xx.fbcdn.net/v/t31.0-8/20247704_476384259392699_8932492623694015537_o.jpg?_nc_cat=108&_nc_eui2=AeE6eM9Gb8Wpe4jeE8ioA4_F9cX4e1iI9DC8_PoZD9i2Uy2sgbSDqRaPVpXkVsMNHd925McLYmkzmnu4Yiu84ZLmquVrSKR9FLnDBmaKBfoXzQ&_nc_ht=scontent-sin6-2.xx&oh=e8bb9a3ecc87e0cf3db63de9f3be9631&oe=5CD6D14A",
	"https://scontent-sin6-2.xx.fbcdn.net/v/t1.0-9/16681693_1634940153187221_4968326126288883684_n.jpg?_nc_cat=101&_nc_eui2=AeEQqwlantFIqMQPTHRiEg3kaohMu8ZFae9pHTMcmD3HzwIzIqsPKiZbpHF7fZvL32NRlFwH-Ak-lRd_BCwlCFVtvgtovfpBTs2wmwTwpaGFLA&_nc_ht=scontent-sin6-2.xx&oh=d18a1f898c799b36b5598090b4f47c47&oe=5CD4D9F2",
	"https://scontent-sin6-1.xx.fbcdn.net/v/t1.15752-9/48369216_563111804138558_6867178713713213440_n.png?_nc_cat=109&_nc_eui2=AeHS7MsTkDofx_CYFfBTzRReKD3ZH8H9INzMiLzhvdWXydKOyX51Wok6zQXWVraL6sKLwJ7vWNi5Z2iRoO154II4GOBns9M8IliBSWBJsEOMDg&_nc_ht=scontent-sin6-1.xx&oh=0d93de55ef6b0ac7c106c1e126d2c6b1&oe=5CBCE4E7",
	"https://scontent-sin6-1.xx.fbcdn.net/v/t1.15752-9/48373394_524492124721348_4341399358508367872_n.png?_nc_cat=103&_nc_eui2=AeErnvwNeNIck6BAIVIDkbxV82eDGkdecjoHBYE-bRYDMAlHRy3Th03-XGT4uvVZvDe8qGiJG_Nt4ok3UaaObex2a0-syzk-NqVPBaejIAqEFg&_nc_ht=scontent-sin6-1.xx&oh=f2df992bda0c00411136e74b54ab564c&oe=5CD5F9E7",
	"https://scontent-sin6-1.xx.fbcdn.net/v/t1.15752-9/48380193_769625740037828_4152776893222879232_n.png?_nc_cat=110&_nc_eui2=AeHABbs_djT4-MZhtcUxxgfTbky5UqXL04fHKSpX_lfTzozcpqJsWwT2Oh2ntXTFNp43FIaWytpU7VjglxACl1ZVB_Xu8s3tgt-rTWbvI7-HDA&_nc_ht=scontent-sin6-1.xx&oh=61b3b10e3cc7dafb5080d5dce28000c7&oe=5CBFA46E"
	]

	constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modal: ModalController) {
		for (let i = 0; i < this.images.length; i++) {
          this.attendants.push({
              id: i + 1,
              likeEvent: new EventEmitter(),
              destroyEvent: new EventEmitter(),
              asBg: sanitizer.bypassSecurityTrustStyle('url('+this.images[i]+')')
          });
      	this.ready = true;
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
