import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';

//Provider
import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the UserDrawPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-draw',
  templateUrl: 'user-draw.html',
})
export class UserDrawPage {

	coinCards = [];
	hasChosen = false;
	cardNumber;
	coinEarned = 0;
	coinValues = [1,2,5,10];
	authKey = this.authProvider.authUser;
	constructor(public navCtrl: NavController, public navParams: NavParams, private db:AngularFireDatabase,
		private authProvider: AuthProvider, private view: ViewController) {
	}

	ionViewDidLoad() {
	    console.log('ionViewDidLoad UserDrawPage');
	    console.log(this.coinValues);
		  this.randomizeCards();
	}

  	randomizeCards(){
  		while(this.coinCards.length<3){
  			let num = this.getRandomInt(0, this.coinValues.length);
  			if(!(this.coinCards.indexOf(this.coinValues[num]) > -1)){
  				this.coinCards.push(this.coinValues[num]);
  			}
  		}
  		console.log(this.coinCards);
  	}

  	pickCard(coin, cardNumber){
  		if(!this.hasChosen){
  			this.cardNumber = cardNumber;
  			this.coinEarned = coin;
  			this.db.list('tools', ref=> ref.child(this.authKey))
  			.query.once('value').then(toolSnap =>{
  				let data = toolSnap.val();
  				let coinCount = data['coins'];
  				this.db.list('tools').update(this.authKey, {
  					coins: coinCount+coin,
  					dailyReward: firebase.database.ServerValue.TIMESTAMP
  				});
  			});
  			this.hasChosen = true;
  		}
  	}

  	getRandomInt(min, max) {	//sample to keep cards going
	    min = Math.ceil(min);
	    max = Math.floor(max);
	    return Math.floor(Math.random() * (max - min)) + min;
	  }
    continue(){
      this.view.dismiss();
    }
}
