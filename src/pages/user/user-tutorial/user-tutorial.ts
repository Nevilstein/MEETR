import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserMatchTutorialPage } from '../user-match-tutorial/user-match-tutorial';
import { UserRewardTutorialPage } from '../user-reward-tutorial/user-reward-tutorial';
import { UserChatTutorialPage } from '../user-chat-tutorial/user-chat-tutorial';
/**
 * Generated class for the UserTutorialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-tutorial',
  templateUrl: 'user-tutorial.html',
})
export class UserTutorialPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserTutorialPage');
  }
  go_swipe(){
    this.navCtrl.push(UserMatchTutorialPage);
  }
  go_reward(){
    this.navCtrl.push(UserRewardTutorialPage);
  }
  go_chatpage(){
    this.navCtrl.push(UserChatTutorialPage);
  }
}
