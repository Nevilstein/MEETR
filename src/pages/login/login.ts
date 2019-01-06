import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import firebase from 'firebase';

import { UserProfilePage } from '../user/user-profile/user-profile';
import {AdminTabsPage} from '../admin/admin-tabs/admin-tabs';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public menuCtrl:MenuController, private fb:Facebook ) {
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }  

  facebookLogin(){
    this.fb.login(['public_profile', 'user_photos', 'email', 'user_birthday']).then( (res: FacebookLoginResponse) => {
      if(res.status === "connected"){
        const fbCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken)
        firebase.auth().signInWithCredential(fbCredential).then( fs => {
          console.log(fs.uid);
          alert("Login Successful");
          this.navCtrl.setRoot(UserProfilePage);
        }).catch(error=>{
          alert("Login Error");
        });
      }
      else{
        console.log("An error occurred...");
      }
    }).catch( (e) => {
      console.log("Error logging in to facebook", e);
    });
  }
  gotoAdmin(){
    this.navCtrl.setRoot(AdminTabsPage);
  }
  gotoUser(){

    this.navCtrl.setRoot(UserProfilePage);
  }
}

