import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';

//Pages
import { UserAskPage } from '../user-ask/user-ask';
import { UserDrawPage } from '../user-draw/user-draw';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import moment from 'moment';

//Provider
import { AuthProvider } from '../../../providers/auth/auth';
import { ToolsProvider } from '../../../providers/tools/tools';
/**
 * Generated class for the UserRewardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-reward',
  templateUrl: 'user-reward.html',
})
export class UserRewardPage {
	authKey = this.authProvider.authUser;
	rewardTime = 86400000;	//day in milliseconds //refresh of reward
	isReward;
	rewardChecker;
  constructor(public navCtrl: NavController, public navParams: NavParams,private viewCtrl: ViewController, private toolsProvider: ToolsProvider,
  	private authProvider: AuthProvider, private db: AngularFireDatabase, private modalCtrl: ModalController) {
  	
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserRewardPage');
    this.checkReward();
    this.rewardChecker = setInterval(()=>{
    	this.checkReward();
    },1000);
  }
  ionViewWillUnload(){
  	clearInterval(this.rewardChecker);
  }

  checkReward(){
  	let dateNow = moment().valueOf();
  	this.db.list('tools', ref => ref.child(this.authKey)).query.once('value', snapshot =>{
  		let data = snapshot.val();
  		this.isReward = (dateNow-data['dailyReward']) >= this.rewardTime ? true : false;
  	});
  }

  rewardHelp(){
  	alert("Go to reward help page.");
  }
  rewardCards(){
  	this.viewCtrl.dismiss();
    let modal = this.modalCtrl.create(UserDrawPage);
    modal.present();  
  }
  rewardAsk(){
    this.viewCtrl.dismiss();
    let modal = this.modalCtrl.create(UserAskPage);
    modal.present();  
  }
  close(){
    this.viewCtrl.dismiss();
  }
}
