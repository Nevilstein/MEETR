import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { UserProfilePage } from '../user/user-profile/user-profile';
import { AdminTabsPage } from '../admin/admin-tabs/admin-tabs';
import {UserTabsPage} from '../user/user-tabs/user-tabs';
import { AngularFireAuth } from 'angularfire2/auth';
import {Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import firebase from 'firebase';
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
  public count : number =0;
  constructor(public navCtrl: NavController, public navParams: NavParams,  public menuCtrl:MenuController, public fb: Facebook) {
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
          this.navCtrl.push(UserProfilePage);
        }).catch(error=>{
          alert("Login Error");
        })
      }
      else{
        console.log("An error occurred...");
      }
    }).catch( (e) => {
      console.log("Error logging in to facebook", e);
    });

    
  }

  gotoAdmin(){
    this.navCtrl.push(AdminTabsPage);
  }
  gotoUser(){
    this.navCtrl.push(UserTabsPage);
  }
  public go_Admin(){
    this.count++;
    if(this.count==5){
      this.navCtrl.push(AdminTabsPage);
    }
  }
}

