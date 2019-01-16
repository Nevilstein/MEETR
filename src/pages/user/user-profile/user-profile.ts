import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../../login/login';
import { UserEditPage } from '../user-edit/user-edit';
import { UserSettingPage } from '../user-setting/user-setting';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, private fb:Facebook) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserProfilePage');
  }
  facebookLogout(){
    this.fb.logout().then( res => {
      alert("Logged out.");
      this.navCtrl.push(LoginPage);
    });
  }

  goBack(){
    this.navCtrl.push(LoginPage);
  }
  user_edit(){
    this.navCtrl.push(UserEditPage);
  }
  user_setting(){
    this.navCtrl.push(UserSettingPage);
  }

}
