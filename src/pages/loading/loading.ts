import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';

//Page

//Plugin
import { Diagnostic } from '@ionic-native/diagnostic';
import { LocationAccuracy } from '@ionic-native/location-accuracy';

/**
 * Generated class for the LoadingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html',
})
export class LoadingPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform, 
  	private diagnostic:Diagnostic, private locationAcc: LocationAccuracy) {
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad LoadingPage');
    this.platform.registerBackButtonAction(() =>{
    	this.platform.exitApp();
    });
  }
  
  enableGeo(){
  	this.diagnostic.isLocationEnabled().then( isAvailable =>{
      if(isAvailable){
        this.navCtrl.pop();
      }else{
        this.locationAcc.request(this.locationAcc.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            this.navCtrl.pop();
          },
          error => {
          	console.log(error);
          });
      }
    }).catch( error =>{
      console.log(error);
    })
  }
}
