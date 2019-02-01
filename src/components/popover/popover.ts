import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserGeoPage } from '../../pages/user/user-geo/user-geo';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';
import firebase from 'firebase';

//Providers
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the PopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent {

	authKey = this.authProvider.authUser;
	chatKey = this.navParams.get('chatKey');
	receiverKey = this.navParams.get('userKey');

  text: string;


  constructor(public navCtrl: NavController, private navParams: NavParams, private authProvider:AuthProvider, 
  	private db: AngularFireDatabase) {
  	console.log(this.authKey);
  	console.log(this.chatKey);
  }

  gotoGeo(){
    this.navCtrl.push(UserGeoPage);
  }
}
