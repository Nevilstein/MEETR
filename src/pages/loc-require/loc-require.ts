import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform } from 'ionic-angular';


// Plugin
import { Diagnostic } from '@ionic-native/diagnostic';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
/**
 * Generated class for the LocRequirePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-loc-require',
  templateUrl: 'loc-require.html',
})
export class LocRequirePage {

	isRetry: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, private diagnostic: Diagnostic, 
  	private locationAcc:LocationAccuracy, private viewCtrl: ViewController, private platform: Platform) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocRequirePage');
    this.locationRequest();
    this.platform.registerBackButtonAction(() =>{
    	this.platform.exitApp();
    });
  }

  locationRequest(){
  	this.isRetry = false;
  	this.locationAcc.request(this.locationAcc.REQUEST_PRIORITY_HIGH_ACCURACY)
  		.then( () => {
            this.checkLocationSetting();
          },
          error => {
          	this.checkLocationSetting();
          });
  }

  checkLocationSetting(){
  	this.diagnostic.isLocationEnabled().then( isAvailable =>{
  		if(isAvailable){
  			this.viewCtrl.dismiss();
  		}
  		else{
  			this.isRetry = true;
  		}
  	});
  }
}
