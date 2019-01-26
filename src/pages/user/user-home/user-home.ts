import { Component,EventEmitter  } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';

//Pages
import { UserReportPage } from '../user-report/user-report';
import { UserCheckPage } from '../user-check/user-check';
import { UserMatchPage } from '../user-match/user-match';

//Libraries
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import geolib from 'geolib';
import moment from 'moment';
import firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
/**
 * Generated class for the UserHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-user-home',
  templateUrl: 'user-home.html',
})
export class UserHomePage {

	// constructor(public navCtrl: NavController) {
		
	// }

	myProfile = [];		//current user profile
	myCoordinates= {};	//current user coordinates
	userList = [];		//list of all users qualified for current user
	stackedUsers = [];	//stacked users
	isReady = false;
	val = 0;
	cardObserver = [];
	matchObserver ;
	//OLD VERSION STARTS HERE

	// ready = true;
	attendants = [];
	cardDirection = "xy";
	cardOverlay: any = {
	  like: {
	      backgroundColor: '#28e93b'
	  },
	  dislike: {
	      backgroundColor: '#e92828'
	  },
	};

	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modalCtrl: ModalController, 
		private fireAuth: AngularFireAuth, private db: AngularFireDatabase) {
		// for (let i = 0; i < this.images.length; i++) {
          // this.attendants.push({
          //     // id: i + 1,
          //     likeEvent: new EventEmitter(),
          //     destroyEvent: new EventEmitter(),
          //     asBg: sanitizer.bypassSecurityTrustStyle('url('+this.images[i]+')')
          // });
  //     	this.ready = true;
		// }
	}

	ionViewDidLoad(){
		this.getLocation();
		this.stackStart();
	}

	ionViewWillUnload(){
		// remove all user card subscription here
	}
	// listenMatch(isStart){
 //    let currentUser = this.fireAuth.auth.currentUser.uid;
	//       this.matchObserver = this.db.list('likes', ref=> ref.child(currentUser).orderByChild("like").equalTo(true))
	//         .snapshotChanges().subscribe( snapshot =>{
	//           console.log(snapshot);
	//           // if(snapshot.length !== 0){
	//           //   let userKey = snapshot[0].key;
	//           //   this.db.list('getLikes', ref=> ref.child(userKey).child(currentUser))
	//           //     .query.once('value').then( childSnap =>{
	//           //       console.log(childSnap);
	//           //       if(childSnap.val()){
	//           //         // this.navCtrl.push(UserMatchPage, {userKey});
	//           //       }
	//           //     });
	//           // }
	//         });
	//       // this.matchListener2 = this.db.list('getLikes', ref => ref.orderByKey().equalTo(currentUser))
	//       //   .snapshotChanges().subscribe( snapshot => {
	//       //     console.log(snapshot);
	//       //   });
	//     // }
	//     // else{
	//     //   this.matchListener.unsubscribe();
	//     //   this.matchListener2.unsubscribe();
	//     // }
	//   }
	onCardInteract(event, swipedUser){	//add swiped user id for the match database
   		// console.log(event);
   		// ADD AGE TO ALL STACKED USERS
   		//ADD UPDATE TO MATCH DATABASE => userid: boolean, date and cooldown if disliked
   		//REMOVE SUBSCRIPTION OF stacked to avoid errors
   		//No delay in card destroy

   		// setTimeout(() =>{
   		// 	this.stackedUsers.splice(0, 1);	//remove 1st stack after adding to db
   		// 	console.log('time');
   		// },500);
   		this.userLike(swipedUser.id, event);
   		this.stackedUsers.splice(0, 1);	//remove 1st stack after adding to db
   		if(this.userList.length>0){
	   		var i = this.getRandomInt(0, this.userList.length);
	   		this.userList.splice(i, 1);
	   		this.getNewCard();
	   	}
	   	else{
	   		if(!(this.stackedUsers.length>0)){
	   			setTimeout(() =>{
	   				this.stackStart();
	   			},500);	//0.5  seconds refresh
	   		}
	   	}
  //  		this.stackedUsers.push({
		// likeEvent: new EventEmitter(),
		// destroyEvent: new EventEmitter(),
		// asBg: this.sanitizer.bypassSecurityTrustStyle('url('+this.images[i]+')')
		// });
	}

	userLike(userID, event){
		let currentUser = this.fireAuth.auth.currentUser.uid;

		this.db.list('likes', ref => ref.child(currentUser)).set(userID, {
			like: event.like,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
		});
		this.db.list('likes', ref => ref.child(userID).child(currentUser))
			.query.once('value').then( snapshot => {
				if(snapshot.val().like && event.like){
					let currentDate = moment().format('x');
					this.db.list('chat', ref => ref.child(currentUser)).push({
						// messages:{	//add starting message? from the second one that liked

						// },
						members:{
							[currentUser]: true,
							[userID]: true,
						},
						timestamp: currentDate,
						createdDate: currentDate
					}).then( uniqueSnap => {	//second liker creates room
						this.db.list('chat', ref => ref.child(userID)).set(uniqueSnap.key, {
							// messages:{	//add starting message? from the second one that liked

							// },
							members:{
								[currentUser]: true,
								[userID]: true,
							},
							timestamp: currentDate,
							createdDate: currentDate
						});	//first also gets the room key
						this.db.list('match', ref => ref.child(currentUser)).set(userID, {
							isSeen: true,
							timestamp: currentDate
						})		//update both users about match
						this.db.list('match', ref => ref.child(userID)).set(currentUser, {
							isSeen: false,
							timestamp: currentDate
						});
					})
					this.modalCtrl.create(UserMatchPage, {userMatchKey:userID}).present();
				}
			});
	}

	getNewCard(){
		let num = this.getRandomInt(0,this.userList.length);
		let newUserCard = this.userList[num];
		this.userList.splice(num,1);	//remove from userList
		this.db.list('profile', ref => ref.orderByKey().equalTo(newUserCard['id']))
			.query.once('value').then( snapshot =>{
				console.log(snapshot);
				let data = snapshot[0].val();	//apply observer/listener to user data
				data["id"] = snapshot[0].key;
				data = {...data, ...{
					likeEvent: new EventEmitter(),
	  				destroyEvent: new EventEmitter(),
	  				asBg: this.sanitizer.bypassSecurityTrustStyle('url('+data['photos'][0]+')')
				}};
				this.stackedUsers.push(data);
			}).then(() =>{
				this.cardObserver.forEach( subscription =>{	//unsubscribe all cards
					subscription.unsubsribe();
				});
				this.cardSubscribe();	//resubscribe all cards
			});
	}

	setCards(){
		var stackPromise = new Promise( resolve => {
			var index;
			this.stackedUsers.forEach( value => {
				this.db.list('profile', ref => ref.child(value.id))
					.query.once('value').then( snapshot =>{
					// snapshot.forEach(element =>{
					// 		// data = element.val();
					// 		// data.id = element.key;
					// 		console.log(element);
					// 	});
					//add a method that gets the index of a certain key if error
					let index = this.stackedUsers.findIndex(x => x.id === snapshot.key);
					this.stackedUsers[index] = snapshot.val();	//apply observer/listener to user data
					this.stackedUsers[index].id = snapshot.key;
					this.stackedUsers[index].age = moment().diff(moment(this.stackedUsers[index].birthday, "MM/DD/YYYY"), 'years');
					this.stackedUsers[index] = {...this.stackedUsers[index], ...{
						likeEvent: new EventEmitter(),
		  				destroyEvent: new EventEmitter(),
		  				asBg: this.sanitizer.bypassSecurityTrustStyle('url('+this.stackedUsers[index].photos[0]+')')
					}}
				});
			});
			resolve(true);
		});
		stackPromise.then(()=>{
			console.log('hey');
			this.cardSubscribe();	//added a listener to check for changes in database
			this.isReady = true;
		})
	}

	stackStart(){
		this.db.list('profile', ref => ref.orderByKey().equalTo(this.fireAuth.auth.currentUser.uid))
			.stateChanges().subscribe( snapshot =>{
				// console.log(snapshot);
				this.userList = [];		//refresh user list and cards if current user profile is changed
				this.stackedUsers = [];

				this.isReady = false; //loading of cards
				this.myProfile = Object.assign([],snapshot.payload.toJSON());
				this.myProfile['id'] = snapshot.key;
				this.getUsers();
			});
	}

	cardSubscribe(){
		this.stackedUsers.forEach( (value, i) => {
			//IF SUBSCRIPTIONS RUINS IT CHANGE THIS TO ONCE VALUE
			this.cardObserver[i] = this.db.list('profile', ref => ref.orderByKey().equalTo(value.id))
					.snapshotChanges().subscribe( snapshot =>{
					//add a method that gets the index of a certain key if error
					let index = this.stackedUsers.findIndex(x => x.id === snapshot[0].key);
					this.stackedUsers[index] = snapshot[0].payload.val();	//apply observer/listener to user data
					this.stackedUsers[index].id = snapshot[0].key;
					this.stackedUsers[index].age = moment().diff(moment(this.stackedUsers[index].birthday, "MM/DD/YYYY"), 'years')
					this.stackedUsers[index] = {...this.stackedUsers[index], ...{
						likeEvent: new EventEmitter(),
		  				destroyEvent: new EventEmitter(),
		  				asBg: this.sanitizer.bypassSecurityTrustStyle('url('+this.stackedUsers[index].photos[0]+')')
					}}
				});
		});		
	}

	getLocation(){
		this.db.list('location', ref=> ref.orderByKey().equalTo(this.fireAuth.auth.currentUser.uid))
			.snapshotChanges().subscribe( snapshot => {
				let data = snapshot[0].payload.toJSON();
				this.myCoordinates = {
					latitude: data['currentLocation'].latitude,
					longitude: data['currentLocation'].longitude
				}
			});
	}

	getUsers(){
		var malePromise = new Promise(resolve => {
			if(this.myProfile['showGender'].male){	//get users by gender
				this.db.list('profile', ref => ref.orderByChild('gender/male')
					.equalTo(true)).query.once('value').then( snapshot =>{
						snapshot.forEach( element =>{
							if(element.key !== this.fireAuth.auth.currentUser.uid){	//avoid getting self
								let data = element.val();
								data.id = element.key;
								data.age = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
								this.userList.push(data);
							}
						}); 
					}).then(() => {
						resolve(true);
					})
			}
			else{
				resolve(true);
			}
		});
		var femalePromise = new Promise(resolve => {
			if(this.myProfile['showGender'].female){
				this.db.list('profile', ref => ref.orderByChild('gender/female')
					.equalTo(true)).query.once('value').then( snapshot => {
						snapshot.forEach(element =>{
							console.log("female");
							if(element.key !== this.fireAuth.auth.currentUser.uid){ //avoid getting self
								let data = element.val();
								data.id = element.key;
								data.age = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
								this.userList.push(data);
							}
						});
					}).then(() => {
						resolve(true);
					})
			}
			else{
				resolve(true);
			}
		});
		Promise.all([malePromise, femalePromise]).then( () =>{	//wait to retrieve userbyGender promise to get values
			// if(this.userList.length !== 0){
				this.filterByLocation();
			// }
		});

		// var genderPromise = new Promise( resolve => {
		// 	this.db.list('profile').query.once('value').then( snapshot =>{
		// 		snapshot.forEach( element =>{
		// 			if(element.key !== this.fireAuth.auth.currentUser.uid){	//avoid getting self
		// 				let data = element.val();
		// 				data.id = element.key;
		// 				data.age = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
		// 				console.log(this.myProfile['showGender'],"=",data['gender'])
		// 				// if(this.myProfile['showGender'] === data.gender){
		// 				// 	this.userList.push(data);
		// 				// }
		// 			}
		// 		}); 
		// 		resolve(true);
		// 	})
		// });
		// genderPromise.then( users => {
		// 	console.log(this.userList);
		// 	this.filterByLocation();
		// })
	}
	filterByLocation(){
		let userCount = 0;
		let userLength = this.userList.length;
		var locationPromise = new Promise(resolve => {
			this.userList.forEach( (value, index) =>{
				this.db.list('location', ref => ref.child(value['id']))
					.query.once('value').then( snapshot => {
						let data = snapshot.val();
						data.id = snapshot.key;
						let otherPoint = {
							latitude: data['currentLocation'].latitude,
							longitude: data['currentLocation'].longitude
						}
						let myPoint ={
							latitude: this.myCoordinates['latitude'],
							longitude: this.myCoordinates['longitude']
						}
						let isInRange = geolib.isPointInCircle(
						    otherPoint,myPoint,
						    this.myProfile['maxDistance']*1000);	//check if in distance preference
						if(!isInRange){	//remove users not in range
							this.userList.splice(index, 1);
						}
					}).then(() =>{	//checks if all users are checked
						userCount++;
						if(userCount == userLength){
							resolve(true);
						}
					});
			})
		});
		locationPromise.then(() => {
			// console.log(this.userList);
			this.filterByAge();
		});
	}

	filterByAge(){
		let userCount = 0;
		let userLength = this.userList.length;
		var agePromise = new Promise(resolve => {
			this.userList.forEach( (value, index) =>{
				this.db.list('profile', ref => ref.child(value['id']))
					.query.once('value').then( snapshot => {
						let data = snapshot.val();
						data.id = snapshot.key;
						let age = value.age;
						let ageRange = this.myProfile['ageRange'];	//age range preference of user
						console.log(age, ageRange.min, ageRange.max);
						let isInRange = ((age >= ageRange.min && 
							age<=ageRange.max) ? true : false);	//check if in range of age preference
						console.log(isInRange);
						if(!isInRange){	//remove users not in range
							this.userList.splice(index, 1);
						}
					}).then(() =>{	//checks if all users are checked
						userCount++;
						if(userCount == userLength){
							resolve(true);
						}
					});
			});
		});
		agePromise.then(() => {
			this.checkLikeStatus();
			// this.stackUser();
		});
	}
	checkLikeStatus(){
		let userLength = this.userList.length;
		var likedPromise = new Promise(resolve =>{
			this.userList.forEach( (value, index) => {
				this.db.list('match', ref => ref.child(this.fireAuth.auth.currentUser.uid).child(value.id))
				.query.once('value').then( matchSnap => {
					if(matchSnap.val()){
						this.userList.splice(index, 1);
					}
					else{
						this.db.list('likes', ref => ref.child(this.fireAuth.auth.currentUser.uid).child(value.id))
						.query.once('value').then( likeSnap =>{
							if(likeSnap.val()){
								let data = likeSnap.val();
								if(data.likes){
									this.userList.splice(index, 1);
								}
								else{
									let dayUnix = 86400000;
									console.log(moment().valueOf()-data.timestamp);
									if((moment().valueOf()-data.timestamp) < dayUnix){
										this.userList.splice(index, 1);
									}
								}
							}
						}).then( () => {
							if(index == userLength){
								resolve(true);
							}
						});
					}
				})
			})
		});
		likedPromise.then(() =>{
			this.stackUser();
		})
	}
	stackUser(){
		let numOfCards = ((this.userList.length<20) ? this.userList.length : 20);	//safety check if low count of users
			for(let i=0; i<numOfCards; i++){
				let num = this.getRandomInt(0,this.userList.length);	//temporarily use random? :P
				this.stackedUsers.push(this.userList[num]);
				this.userList.splice(num,1);	//remove the user from list
			}
		this.setCards();
	}

	report_user(){
		const report = this.modalCtrl.create(UserReportPage);
		report.present();
	}	
	check_user(){
		const check = this.modalCtrl.create(UserCheckPage);
		check.present();
	}

	getRandomInt(min, max) {	//sample to keep cards going
	    min = Math.ceil(min);
	    max = Math.floor(max);
	    return Math.floor(Math.random() * (max - min)) + min;
	}

	match_overlay(){
		const match = this.modalCtrl.create(UserMatchPage);
		match.present();
	}
}