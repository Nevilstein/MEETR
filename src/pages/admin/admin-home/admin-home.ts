import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {LoginPage} from '../../login/login';
/**
 * Generated class for the AdminHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-admin-home',
  templateUrl: 'admin-home.html',
})
export class AdminHomePage {

  constructor(public navCtrl: NavController,public alertCtrl: AlertController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminHomePage');
  }
  goBack(){
  	this.navCtrl.setRoot(LoginPage);
  }
  click_card1() {
    const alert = this.alertCtrl.create({
      title: 'You clicked a card!',
      subTitle: 'You just clicked card 1',
      buttons: ['OK']
    });
    alert.present();
  }
  click_card2() {
    const alert = this.alertCtrl.create({
      title: 'You clicked a card!',
      subTitle: 'You just clicked card 2',
      buttons: ['OK']
    });
    alert.present();
  }
  click_card3() {
    const alert = this.alertCtrl.create({
      title: 'You clicked a card!',
      subTitle: 'You just clicked card 3',
      buttons: ['OK']
    });
    alert.present();
  }
  click_card4() {
    const alert = this.alertCtrl.create({
      title: 'You clicked a card!',
      subTitle: 'You just clicked card 4',
      buttons: ['OK']
    });
    alert.present();
  }
}
