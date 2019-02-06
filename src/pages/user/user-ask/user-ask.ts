import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';


//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import moment from 'moment';
import firebase from 'firebase';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { MatchProvider } from '../../../providers/match/match';
/**
 * Generated class for the UserAskPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-ask',
  templateUrl: 'user-ask.html',
})
export class UserAskPage {
	authKey = this.authProvider.authUser;
	questionReady = false;
	currentQuestion
	quizTime = 86400000;	//day in milliseconds //refresh of questions
	myAnswer:string = "";
	coinValue = 5;

  quizDuration = 7*86400000; //7 days in milliseconds is the duration of all questions
  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase, 
  	private authProvider: AuthProvider, private toastCtrl: ToastController, private view: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserAskPage');
    this.checkQuestion();
  }
  checkQuestion(){
  	let dateNow = moment().valueOf();
  	this.db.list('tools', ref => ref.child(this.authKey)).query.once('value', snapshot =>{
  		let data = snapshot.val();
  		let isQuiz = (dateNow-data['question'].timestamp) >= this.quizTime ? true : false;
  		if(isQuiz){
  			this.getQuestion()
  		}
  		else{
  			this.currentQuestion = data['question'];
  			this.questionReady = true;
  		}
  	});
  }
  getQuestion(){
  	var userQuiz = [];
  	var quizList = [];
  	this.db.list('answers', ref=> ref.child(this.authKey).orderByChild('timestamp').limitToLast(10))
      .query.once('value', snapshot =>{
        let dateNow = moment().valueOf();
    		snapshot.forEach( element => {
    			let data = element.val();
          if((dateNow-data['timestamp'])<this.quizDuration){
            userQuiz.push(data);
          }
    		});
    	}).then(()=>{
    		this.db.list('questions', ref=> ref.orderByKey()).query.once('value', snapshot =>{
    			snapshot.forEach(element =>{
    				var data = {
    					question: element.val(),
    					id: element.key
    				}
    				quizList.push(data);
    			});
    		}).then(() =>{
          let dateNow = moment().valueOf();
    			quizList = quizList.filter(item =>{
    				return !((userQuiz.findIndex(x => x.id === item.id)) > -1);
    			});
    			let randomValue = this.getRandomInt(0, quizList.length);
    			let questionID = quizList[randomValue].id;
    			this.currentQuestion = {
    				id: questionID,
    				name: quizList[randomValue].question
    			}
    			this.db.list('tools').update(this.authKey, {
    				question:{
    					id: questionID,
    					name: quizList[randomValue].question,
    					timestamp: firebase.database.ServerValue.TIMESTAMP
    				}
    			});
    			this.questionReady = true;
    		});
    	});
  }
  	getRandomInt(min, max) {	//sample to keep cards going
	    min = Math.ceil(min);
	    max = Math.floor(max);
	    return Math.floor(Math.random() * (max - min)) + min;
	}

	cancel(){
		this.view.dismiss();
	}
	answer(question){
		let questionKey = question['id'];
		let userQuestion = question['name'];
		if(this.myAnswer.trim() === ''){
			alert("Please enter your answer.");
		}
		else{
			this.db.list('answers', ref=> ref.child(this.authKey)).push({
        id: questionKey,
				question: userQuestion,
				answer: this.myAnswer,
				timestamp: firebase.database.ServerValue.TIMESTAMP
			}).then(()=>{
				this.db.list('tools', ref=> ref.child(this.authKey))
	  			.query.once('value').then(toolSnap =>{
	  				let data = toolSnap.val();
	  				let coinCount = data['coins'];
	  				this.db.list('tools').update(this.authKey, {
	  					coins: coinCount+this.coinValue,
	  					dailyReward: firebase.database.ServerValue.TIMESTAMP
	  				});
	  			});
			}).then(()=>{
				this.view.dismiss().then(() =>{
					let toast = this.toastCtrl.create({
                message: "You earned 5 coins",
                duration: 2000,
                position: 'top'
              });
              toast.present();
				});
			});
		}
	}

}
