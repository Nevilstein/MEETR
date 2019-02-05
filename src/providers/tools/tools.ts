import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import moment from 'moment';
import firebase from 'firebase';
/*
  Generated class for the ToolsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ToolsProvider {
	authKey = this.fireAuth.auth.currentUser.uid;
	isReward = false;
	isBoost = false;
	currentQuestion;
  myCoins;
	boostEffect = 86400000; //day in milliseconds //refresh of boost
	rewardTime = 86400000;	//day in milliseconds //refresh of reward
  constructor(public http: HttpClient, private db: AngularFireDatabase, private fireAuth: AngularFireAuth) {
    console.log('Hello ToolsProvider Provider');
    this.getTools();
  }
  getTools(){
  	let dateNow = moment().valueOf();
  	this.db.list('tools', ref => ref.child(this.authKey)).query.once('value', snapshot =>{
  		let data = snapshot.val();
  		this.isBoost = (dateNow-data['boost']) < this.boostEffect ? true : false;
  		this.isReward = (dateNow-data['dailyReward']) >= this.rewardTime ? true : false;
      this.myCoins = data['coins'];
  		this.currentQuestion = data['question'].name;
  	});
  }
  // getQuestion(){
  // 	var profileQuiz = [];
  // 	var quizList = [];
  // 	this.db.list('profile', ref=> ref.child(this.authKey)).query.once('value', snapshot =>{
  // 		let data = snapshot.val();
  // 		if(data['questions']){
  // 			profileQuiz = data['questions'];
  // 		}
  // 	}).then(()=>{
  // 		this.db.list('questions', ref=> ref.orderByKey()).query.once('value', snapshot =>{
  // 			snapshot.forEach(element =>{
  // 				var data = {
  // 					question: element.val(),
  // 					id: element.key
  // 				}
  // 				quizList.push(data);
  // 			});
  // 		}).then(() =>{
  // 			console.log(quizList);
  // 			quizList = quizList.filter(item =>{
  // 				return !((profileQuiz.findIndex(x => x.id === item.id)) > -1);
  // 			});
  // 			console.log(quizList);
  // 			let randomValue = this.getRandomInt(0, quizList.length);
  // 			this.currentQuestion = quizList[randomValue].question;
  // 			this.db.list('tools').update(this.authKey+"/question", {
  // 				name: this.currentQuestion,
  // 				timestamp: firebase.database.ServerValue.TIMESTAMP
  // 			})
  // 		});
  // 	});
  // }
 //  getRandomInt(min, max) {	//sample to keep cards going
	//     min = Math.ceil(min);
	//     max = Math.floor(max);
	//     return Math.floor(Math.random() * (max - min)) + min;
	// }
}
