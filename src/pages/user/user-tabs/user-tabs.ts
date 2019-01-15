import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { Tabs } from 'ionic-angular';
import { UserProfilePage } from '../user-profile/user-profile';
import { UserHomePage } from '../user-home/user-home';
import { UserChatPage } from '../user-chat/user-chat';

//Providers
import { UserProvider } from '../../../providers/user/user';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, private userProvider: UserProvider, private appCtrl: App) {
  }

  @ViewChild('userTab') tabRef: Tabs;
  user_tab1root = UserProfilePage;
  user_tab2root = UserHomePage;
  user_tab3root = UserChatPage;

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserTabsPage');
    //Load all first to start data (for async purposes)
    // this.tabRef.getAllChildNavs().forEach( nav =>{
    //   this.tabRef.select(nav.index);
    // })

    // this.tabRef.select(0).then(() =>{
    //   this.
    // })
    
    // this.tabRef.ionChange.subscribe(res =>{
    //   console.log(res.index);
    // });
    
  }

}
