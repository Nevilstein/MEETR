import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProfilePage } from '../user-profile/user-profile';
import { UserHomePage } from '../user-home/user-home';
import { UserChatPage } from '../user-chat/user-chat';

/**
 * Generated class for the UserTabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-tabs',
  templateUrl: 'user-tabs.html',
})
export class UserTabsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
  user_tab1root=UserProfilePage;
  user_tab2root=UserHomePage;
  user_tab3root=UserChatPage;

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserTabsPage');
  }

}
