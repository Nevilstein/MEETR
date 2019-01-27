import { NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, App} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

//Pages
import { LoginPage } from '../../pages/login/login';

//Plugins
import { AngularFireAuth } from 'angularfire2/auth';
import { Facebook } from '@ionic-native/facebook';

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {
	authUser;
  constructor(public http: HttpClient, private fireAuth: AngularFireAuth, private zone: NgZone, private appCtrl: App, 
  	private fb: Facebook) {
    console.log('Hello AuthProvider Provider');
    this.fireAuth.authState.subscribe( fireRes =>{
    	this.fb.getLoginStatus().then(fbRes =>{
	    	if(!fireRes && fbRes.status !== 'connected'){
	          zone.run(() => {
	              appCtrl.getRootNav().setRoot(LoginPage);
	          });
	        }
	        else{
	          this.authUser = fireRes.uid;
	        }
	    })
    });
  }

}