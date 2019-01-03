import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {LoginPage} from '../../login/login';
import {UserEditPage} from '../user-edit/user-edit';
import {UserSettingPage} from '../user-setting/user-setting';

/**
 * Generated class for the UserProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserProfilePage');
  }
  goBack(){
  	this.navCtrl.setRoot( LoginPage );
  }
  user_edit(){
  	this.navCtrl.setRoot(UserEditPage);
  }
  user_setting(){
    this.navCtrl.setRoot(UserSettingPage);
  }

}
