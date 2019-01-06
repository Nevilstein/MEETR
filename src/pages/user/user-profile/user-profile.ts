import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import {LoginPage} from '../../login/login';
import {UserEditPage} from '../user-edit/user-edit';
import {UserSettingPage} from '../user-setting/user-setting';
import firebase from 'firebase';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, private fb: Facebook) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserProfilePage');
  }
  user_edit(){
  	this.navCtrl.setRoot(UserEditPage);
  }
  user_setting(){
    this.navCtrl.setRoot(UserSettingPage);
  }
  facebookLogout(){
    this.fb.logout().then( res => {
      alert("Logged out.");
      this.navCtrl.setRoot(LoginPage);
      firebase.auth().signOut();

      // CHECK LOGGED USER
      // firebase.auth().onAuthStateChanged( fs =>{
      //   console.log(fs);
      // });
    });
  }
}
