import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the UserMatchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-match',
  templateUrl: 'user-match.html',
})
export class UserMatchPage {

  constructor(public navCtrl: NavController, public navParams: NavParams ,private view: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserMatchPage');
  }
  keep_swiping(){
  	this.view.dismiss();
  }

}
