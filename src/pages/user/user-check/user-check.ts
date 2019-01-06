import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the UserCheckPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-check',
  templateUrl: 'user-check.html',
})
export class UserCheckPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,private view: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserCheckPage');
  }
  close_modal(){
  	this.view.dismiss();
  }

}
