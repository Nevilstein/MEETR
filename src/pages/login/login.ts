import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
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

  constructor(public navCtrl: NavController, public facebook:Facebook, public navParams: NavParams, public menuCtrl:MenuController ) {
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }  
  gotoAdmin(){
    this.navCtrl.setRoot(AdminTabsPage);
  }
  gotoUser(){

    this.navCtrl.setRoot(UserProfilePage);
  }
}

