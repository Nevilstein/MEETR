import { Component,EventEmitter  } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';

//Pages
import { UserReportPage } from '../user-report/user-report';
import { UserCheckPage } from '../user-check/user-check';
import { UserMatchPage } from '../user-match/user-match';
import { UserEditPage } from '../user-edit/user-edit';

//Libraries
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import geolib from 'geolib';
import moment from 'moment';
import firebase from 'firebase';
import { Observable } from 'rxjs/Observable';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
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

	authUser = this.authProvider.authUser;  //ID of authenticated user

	myProfile = [];		//current user profile
	myCoordinates= {};	//current user coordinates
	userList = [];		//list of all users qualified for current user
	stackedUsers = [];	//stacked users
	isReady = false;
	val = 0;
	findUserCount = 0;
	//Observers/Subscriptions
	cardObserver = [];
	profileChangedObserver;
	geolocationObserver

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

	constructor(private sanitizer: DomSanitizer, public navCtrl: NavController, private alertCtrl: AlertController, private modalCtrl: ModalController, 
		private fireAuth: AngularFireAuth, private db: AngularFireDatabase, private authProvider: AuthProvider) {
		
	}

	ionViewDidLoad(){
		this.changedProfile();	//stacking starts inside this function
	    this.getLocation();
	}

	ionViewWillUnload(){
		this.cardObserver.forEach( value => {
			value.unsubscribe();
		})
		this.profileChangedObserver.unsubscribe();
		this.geolocationObserver.unsubscribe();
	}

	changedProfile(){	//if user changed profile the stack restarts
		this.profileChangedObserver = this.db.list('profile', ref => ref.orderByKey().equalTo(this.authUser))
			.stateChanges().subscribe( snapshot =>{
				this.isReady = false; //loading of cards
				this.myProfile = Object.assign([],snapshot.payload.toJSON());
				this.myProfile['id'] = snapshot.key;
				this.stackStart();
			});
	}
	onCardInteract(event, swipedUser){	//add swiped user id for the match database
   		// console.log(event);

   		// setTimeout(() =>{
   		// 	this.stackedUsers.splice(0, 1);	//remove 1st stack after adding to db
   		// 	console.log('time');
   		// },500);

		this.userLike(swipedUser.id, event);	//add interacted user to db
   		var deletePromise = new Promise( resolve => {	//wait for user/card to be destroyed fully
   			setTimeout(() => {
   				// let swipedIndex = this.stackedUsers.indexOf(swipedUser);
   				this.stackedUsers.splice(0, 1);	//remove 1st stack after adding to db
   				resolve(true);
   			},200);
   		});
   		deletePromise.then( () => {
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
		});
	}

	getNewCard(){
		let num = this.getRandomInt(0,this.userList.length);
		let newUserCard = this.userList[num];
		this.userList.splice(num,1);	//remove from userList
		this.db.list('profile', ref => ref.orderByKey().equalTo(newUserCard['id']))
			.query.once('value').then( snapshot =>{
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

	userLike(userID, event){
		this.db.list('likes', ref => ref.child(this.authUser)).set(userID, {
			like: event.like,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
		});
		this.db.list('likes', ref => ref.child(userID).child(this.authUser))
			.query.once('value').then( snapshot => {
				if(snapshot.val()){		//if like is found
					if(snapshot.val().like && event.like){
						let currentDate = moment().valueOf();
						this.db.list('chat', ref => ref.child(this.authUser)).push({
							sender:	this.authUser,
							receiver: userID,
							unseenCount: 0,
							matchStatus: true,
							timestamp: currentDate,
							createdDate: currentDate,
							geoStatus: false
						}).then( uniqueSnap => {	//second liker creates room
							this.db.list('chat', ref => ref.child(userID)).set(uniqueSnap.key, {
								sender:	userID,
								receiver: this.authUser,
								unseenCount: 0,
								matchStatus: true,
								timestamp: currentDate,
								createdDate: currentDate,
								geoStatus: false
							})	//first also gets the room key
							this.db.list('match', ref => ref.child(this.authUser)).set(userID, {
								isSeen: true,
								timestamp: currentDate
							})		//update both users about match
							this.db.list('match', ref => ref.child(userID)).set(this.authUser, {
								isSeen: false,
								timestamp: currentDate
							});
						}).then(() => {
							this.modalCtrl.create(UserMatchPage, {userMatchKey:userID}).present();
						});
					}
				}
			})
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
			this.cardSubscribe();	//added a listener to check for changes in database
			setTimeout(()=>{    //<<<---    using ()=> syntax
			    this.isReady = true;
			}, 3000);
		})
	}

	stackStart(){
		this.userList = [];		//refresh user list and cards if current user profile is changed
		this.stackedUsers = [];
		this.cardObserver.forEach( subscription => {
			subscription.unsubscribe();
		});
		this.isReady = false; //loading of cards
		this.getUsers();
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
		this.geolocationObserver = this.db.list('location', ref=> ref.orderByKey().equalTo(this.authUser))
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
							if(element.key !== this.authUser){	//avoid getting self
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
							if(element.key !== this.authUser){ //avoid getting self
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
			this.filterByLocation();
		});
	}
	filterByLocation(){
		let newList = [];
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
						if(isInRange){	//remove users not in range
							newList.push(value);
						}
					}).then(() =>{
						console.log(index+1, "===", userLength);
						if(index+1 === userLength){
							resolve(true);
						}
					});
			})
		});
		locationPromise.then(() => {
			this.userList = newList;	//change update current list
			this.filterByAge();
		});
	}

	filterByAge(){
		let newList = [];
		let userLength = this.userList.length;
		var agePromise = new Promise(resolve => {
			if(userLength>0){
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
							if(isInRange){	//remove users not in range
								newList.push(value);
							}
						}).then(() =>{
							if(index+1 === userLength){
								resolve(true);
							}
						});
					});
			}
			
		});
		agePromise.then(() => {
			this.userList = newList;
			this.checkLikeStatus();
		});
	}
	checkLikeStatus(){
		let newList = [];
		let userLength = this.userList.length;
		var likedPromise = new Promise(resolve =>{
			this.userList.forEach( (value, index) => {
				this.db.list('match', ref => ref.child(this.authUser).child(value.id))
				.query.once('value').then( matchSnap => {
					if(!matchSnap.val()){	//if not found in match collection
						this.db.list('likes', ref => ref.child(this.authUser).child(value.id))
						.query.once('value').then( likeSnap =>{
							if(likeSnap.val()){	//if liked/unliked
								let data = likeSnap.val();
								let dayUnix = 86400000;
								let timeUnliked = moment().valueOf()-data.timestamp;
								if(!data.likes && timeUnliked >= dayUnix){	//if unliked and in cooldown(1 day cooldown)
									newList.push(value);
								}
							}
							else{	//if not liked/unliked yet
								newList.push(value);
							}
						}).then(() =>{
							if(index+1 === userLength){
								resolve(true);
							}
						});
					}
					else{	//if found in match
						if(index+1 === userLength){
							resolve(true);
						}
					}
				})
			})
		});
		likedPromise.then(() =>{
			this.userList = newList;
			this.stackUser();
		})
	}
	stackUser(){
		let numOfCards = ((this.userList.length<20) ? this.userList.length : 20);	//safety check if low count of users
		for(let i=0; i<numOfCards; i++){
			let num = this.getRandomInt(0, this.userList.length);	//temporarily use random? :P
			this.stackedUsers.push(this.userList[num]);
			this.userList.splice(num,1);	//remove the user from list
		}
		if(numOfCards>0){
			this.setCards();
		}
		else{
			setTimeout( () => {
				if(this.findUserCount === 10){
					let alert = this.alertCtrl.create({
					    title: 'No users found!',
					    message: 'Please change your preferences',
					    buttons: [
					      {
					        text: 'Cancel',
					        role: 'cancel',
					        handler: () => {
					          console.log('Cancel clicked');
					        }
					      },
					      {
					        text: 'Edit now',
					        handler: () => {
					          this.navCtrl.push(UserEditPage);
					        }
					      }
					    ]
					  });
					  alert.present();
				}
				else{
					this.findUserCount++;
					this.stackStart();
				}
			}, 3000);
			//loop to find users again
			// this.findUserCount++;	//findUserCount to check how many times the app looked for match; it notifies user to update interest
		}
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