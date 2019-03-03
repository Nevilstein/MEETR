import { Component,EventEmitter  } from '@angular/core';
import { IonicPage, NavController, NavParams , ModalController, LoadingController, 
	ToastController} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';

//Pages
import { UserReportPage } from '../user-report/user-report';
import { UserCheckPage } from '../user-check/user-check';
import { UserMatchPage } from '../user-match/user-match';
import { UserEditPage } from '../user-edit/user-edit';
import { UserGeoPage } from '../user-geo/user-geo';
import { UserRewardPage } from '../user-reward/user-reward';
import { UserMatchTutorialPage } from '../user-match-tutorial/user-match-tutorial';
import { UserAllTutorialPage } from '../user-all-tutorial/user-all-tutorial';

//Libraries
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import geolib from 'geolib';
import moment from 'moment';
import firebase from 'firebase';
import { Observable } from 'rxjs/Observable';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { MatchProvider } from '../../../providers/match/match';
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

	authUser = this.authProvider.authUser;  //ID of authenticated user
	show=false;
	hideMe=true;
	//list 
	userList = [];		//list of all users qualified for current user
	// userBoostList = [];	//list of users who used boosts
	userLikerList = []; //prioritize users who liked you
	userSuperList = []; //prioritize users who liked you
	userBoostList = []; //prioritize users who liked you
	userTopPicks = [];	//select your daily top picks

	myProfile = [];		//current user profile
	myCoordinates= {};	//current user coordinates
	stackedUsers = [];	//stacked users

	isReady = false;
	maxLikes = 10;	//max number of likes of user
	boostEffect = 86400000;	//day in milliseconds //activeness of boost
	rewardTime = 86400000;	//day in milliseconds //refresh of reward
	refreshTime = 86400000;	//day in milliseconds //refresh of likes or more?
	isBoost = false;
	isReward;
	myCoins = 0;
	buttonsEnabled = true;

	findUserCount = 0;	//number of times user finding occurred
	tools: any = {
		likes: {
			limit: 10 //default
		}
	};

	// Tool Prices
	extralikeValue = 5;
	superlikeValue = 20;
	rewindValue = 10;
	boostValue = 50;


//Observers/Subscriptions
	// cardObserver = [];
	profileChangedObserver;
	geolocationObserver;
	toolsObserver;
	rewardChecker;	//timeInterval while data loads
	timeChecker;

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

	constructor(private sanitizer: DomSanitizer,public navCtrl:NavController, private alertCtrl: AlertController, 
		private modalCtrl: ModalController, private fireAuth: AngularFireAuth, private db: AngularFireDatabase, 
		private authProvider: AuthProvider,	private matchProvider: MatchProvider, private loadingCtrl: LoadingController,
		private toastCtrl: ToastController) {
		
	}

	ionViewDidLoad(){	
	    if(this.authProvider.isFirstLogin){	//tutorials for first login users
	     	let modal = this.modalCtrl.create(UserAllTutorialPage);
	     	modal.present();
	     	modal.onDidDismiss(() =>{
	     		let modal = this.modalCtrl.create(UserRewardPage);
		    	modal.present();
	     	})
	    }
		this.changedProfile();	//stacking starts inside this function
	    this.getLocation();
	    this.getTools();
	    this.rewardChecker = setInterval(() =>{
	    	if(this.isReward != undefined && this.isReward && !this.authProvider.isFirstLogin){
	    		clearInterval(this.rewardChecker);
		    	let modal = this.modalCtrl.create(UserRewardPage);
		    	modal.present();
		    }
	    }, 1000);
	}

	ionViewWillUnload(){
		// this.cardObserver.forEach( value => {
		// 	value.unsubscribe();
		// })
		this.profileChangedObserver.unsubscribe();
		this.geolocationObserver.unsubscribe();
		this.toolsObserver.unsubscribe();
		clearInterval(this.timeChecker);
	}

	changedProfile(){	//if user changed profile the stack restarts
		this.profileChangedObserver = this.db.list('profile', ref => ref.orderByKey().equalTo(this.authUser))
			.stateChanges().subscribe( snapshot =>{
				this.isReady = false; //loading of cards
				this.myProfile = Object.assign([],snapshot.payload.toJSON());
				this.myProfile['id'] = snapshot.key;
				this.findUserCount = 0;	//reset find counter
				this.stackStart();
			});
	}

	getLocation(){
		this.geolocationObserver = this.db.list('location', ref=> ref.orderByKey().equalTo(this.authUser))
			.snapshotChanges().subscribe( snapshot => {
				snapshot.forEach( element =>{
					let data = element.payload.toJSON();
					this.myCoordinates = {
						latitude: data['currentLocation'].latitude,
						longitude: data['currentLocation'].longitude
					}
				});
			});
	}
	getTools(){
		this.toolsObserver = this.db.list('tools', ref=> ref.orderByKey().equalTo(this.authUser))
			.snapshotChanges().subscribe( snapshot => {
				snapshot.forEach( element =>{
					let data = element.payload.toJSON();
					let dateNow = moment().valueOf();
					let willRefresh = (dateNow-data['likes'].timestamp) >= this.refreshTime ? true: false;
					// this.toolsProvider.isBoost = (dateNow-this.tools['boost']) < this.boostEffect ? true : false;
					// this.isBoost = this.toolsProvider.isBoost;
					// this.toolsProvider.isReward = (dateNow-this.tools['dailyReward']) >= this.rewardTime ? true : false;
					// this.isReward = this.toolsProvider.isReward;
					this.myCoins = data['coins'];
					this.isBoost = (dateNow-data['boost']) < this.boostEffect ? true : false;
					this.isReward = (dateNow-data['dailyReward']) >= this.rewardTime ? true : false;
					if(data['likes'].limit < this.maxLikes && willRefresh){	//refresh time of likes
						this.db.list('tools').update(this.authUser+"/likes", {
							limit: 10
						});
					}
					this.tools = data;
				});
			});		
		this.timeChecker = setInterval(() =>{
			let dateNow = moment().valueOf();
			let willRefresh = (dateNow-this.tools['likes'].timestamp) >= this.refreshTime ? true: false;
			this.isBoost = (dateNow-this.tools['boost']) < this.boostEffect ? true : false;
			this.isReward = (dateNow-this.tools['dailyReward']) >= this.rewardTime ? true : false;
			// this.toolsProvider.isBoost = (dateNow-this.tools['boost']) < this.boostEffect ? true : false;
			// this.isBoost = this.toolsProvider.isBoost;
			// this.toolsProvider.isReward = (dateNow-this.tools['dailyReward']) >= this.rewardTime ? true : false;
			// this.isReward = this.toolsProvider.isReward;
			if(this.tools['likes'].limit < this.maxLikes && willRefresh){	//refresh time of likes
				this.db.list('tools').update(this.authUser+"/likes", {
					limit: 10
				});
			}
	    }, 2000);

	}

	onCardInteract(event, swipedUser){	//add swiped user id for the match database
   		//if liked and coins insufficient display add coins shop
   		//also add a function to get the latest liked user and return to top stack like rewind

   		// setTimeout(() =>{
   		// 	this.stackedUsers.splice(0, 1);	//remove 1st stack after adding to db
   		// },500);

   		let isLiked = event.like;
   		if((isLiked && !(this.tools['likes'].limit > 0))){
   			this.stackedUsers.splice(0, 1);
   			this.returnCard(swipedUser.id);
   			alert('Like limit is reached. Use the like button and coins to proceed.');
   		}
   		else{
   			this.buttonsEnabled = false;
			this.userLike(swipedUser.id, isLiked);	//add interacted user to db
	   		var deletePromise = new Promise( resolve => {	//wait for user/card to be destroyed fully
	   			setTimeout(() => {
	   				// let swipedIndex = this.stackedUsers.indexOf(swipedUser);
	   				this.stackedUsers.splice(0, 1);	//remove 1st stack after adding to db
	   				this.buttonsEnabled = true;
	   				resolve(true);
	   			},200);
	   		});
	   		deletePromise.then( () => {
	   			if(this.userList.length>0){
			   		var i = this.getRandomInt(0, this.userList.length);
			   		this.userList.splice(i, 1);
			   		this.getCard();	//get new card with percentage
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
	}

	onLikeButton(swipedUser, isLiked){
		//if liked and coins insufficient display add coins shop

		if(this.stackedUsers.length > 0){
					//Change this to small animation
			let usedLike = (isLiked && this.tools['likes'].limit>0);
			let usedExtraLike = (isLiked && !(this.tools['likes'].limit>0) && this.myCoins>=this.extralikeValue);
			let notEnoughMoney = (isLiked && !(this.tools['likes'].limit>0) && !(this.myCoins>=this.extralikeValue));
			if(usedExtraLike){
				this.tools['likes'].limit++;	//add value and subtract later in next function
				this.toolPurchase(this.extralikeValue);	 //
			}else if(notEnoughMoney){
				alert("Not enough coins to use extra like.");
			}
			if(!isLiked || usedLike || usedExtraLike){
				if(isLiked){
					let toast = this.toastCtrl.create({
		              message: "Liked!",
		              duration: 1000,
		              position: 'top',
		              cssClass: "like_toast",
		            });
		            toast.present();
				}
				else{
					let toast = this.toastCtrl.create({
		              message: "Disliked",
		              duration: 1000,
		              position: 'top',
		              cssClass: "dislike_toast",
		            });
		            toast.present();
				}
				this.buttonsEnabled = false;
				this.userLike(swipedUser.id, isLiked);
		   		var deletePromise = new Promise( resolve => {	//wait for user/card to be destroyed fully
		   			setTimeout(() => {
		   				// let swipedIndex = this.stackedUsers.indexOf(swipedUser);
		   				this.stackedUsers.splice(0, 1);	//remove 1st stack after adding to db
		   				this.buttonsEnabled = true;	
		   				resolve(true);
		   			},200);
		   		});
		   		deletePromise.then( () => {
		   			
		   			if(this.userList.length>0){
				   		var i = this.getRandomInt(0, this.userList.length);
				   		this.userList.splice(i, 1);
				   		this.getCard();	//get new card with percentage
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
		}
	}

	onSuperLike(swipedUser, isLiked, superlike){
		if(this.myCoins>=this.superlikeValue){
			let toast = this.toastCtrl.create({
	          message: "Superliked",
	          duration: 2000,
	          position: 'top',
	          cssClass: "superlike_toast",
	        });
	        toast.present();
	        this.buttonsEnabled = false;
	        this.toolPurchase(this.superlikeValue);
			this.userLike(swipedUser.id, isLiked, superlike);
	   		var deletePromise = new Promise( resolve => {	//wait for user/card to be destroyed fully
	   			setTimeout(() => {
	   				// let swipedIndex = this.stackedUsers.indexOf(swipedUser);
	   				this.stackedUsers.splice(0, 1);	//remove 1st stack after adding to db
	   				this.buttonsEnabled = true;	
	   				resolve(true);
	   			},200);
	   		});
	   		deletePromise.then( () => {
	   			if(this.userList.length>0){
			   		var i = this.getRandomInt(0, this.userList.length);
			   		this.userList.splice(i, 1);
			   		this.getCard();	//get new card with percentage
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
		else{
			alert("Not enough coins to use super like.");
		}
	}

	userLike(userID, isLiked, superlike: boolean = false){

		if(this.tools['likes'].limit === this.maxLikes && !superlike){	//updating tools
			this.db.list('tools').update(this.authUser+"/likes", {
				timestamp: firebase.database.ServerValue.TIMESTAMP
			});
   		}

   		if(isLiked && !superlike){
   			this.db.list('tools').update(this.authUser+"/likes", {
				limit: this.tools['likes'].limit - 1
			});
   		}
   		
		this.db.list('likes', ref => ref.child(this.authUser)).set(userID, {
			like: isLiked,
			superlike: superlike,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
		});
		this.db.list('likes', ref => ref.child(userID).child(this.authUser))
			.query.once('value').then( snapshot => {
				if(snapshot.val()){		//if like is found
					if(snapshot.val().like && isLiked){
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
							this.matchProvider.userKey = userID;
							this.modalCtrl.create(UserMatchPage).present();
						});
					}
				}
			})
	}

	onRewind(){
		//if coins insufficient display add coins shop
		if(this.myCoins >= this.rewindValue){
			this.buttonsEnabled = false;
			this.db.list('likes', ref=> ref.child(this.authUser).orderByChild('like').equalTo(false))
				.query.once('value').then(snapshot => {
					let dislikedUsers = [];
					// snapshot.forEach( element =>{
					// 	let data = element.val();
					// 	data['id'] = element.key;
					// 	if(!data['like']){
					// 		dislikedUsers.push(data);
					// 	}
					// });
					// let latestUser = dislikedUsers.
					snapshot.forEach(element => {
						let data = element.val();
						data['id'] = element.key;
						dislikedUsers.push(data);
					});
					let dateNow = moment().valueOf();
					let dayUnix = 86400000;
					dislikedUsers.filter(item => {	//filter by users past a day
						return (item.timestamp-dateNow) <= dayUnix;
					});
					dislikedUsers.sort((a,b) => (a.timestamp < b.timestamp)? 1: -1);	//sort by timestamp
					if(dislikedUsers.length>0){
						this.toolPurchase(this.rewindValue);
						let lastUser = dislikedUsers[0].id;	//last disliked user id
						this.db.list('likes', ref => ref.child(this.authUser)).remove(lastUser);
						this.returnCard(lastUser);	//get latest disliked user's data
						let toast = this.toastCtrl.create({
							message: "Rewound!",
							duration: 1000,
							position: 'top',
							cssClass: "rewind_toast",
							});
						toast.present();
					}
					else{
						alert("No more users disliked recently.");
					}
				this.buttonsEnabled = true;
				});
		}else{
			alert("Not enough coins to use rewind.");
		}
	}

	onBoost(){
		if(this.myCoins >= this.boostValue){
			this.toolPurchase(this.boostValue);
			this.db.list('tools').update(this.authUser, {
				boost: firebase.database.ServerValue.TIMESTAMP
			}).then(() =>{
				let toast = this.toastCtrl.create({
	              message: "User boost is up.",
	              duration: 2000,
	              position: 'top',
	              cssClass: "boost_toast",
	            });
	            toast.present();
				this.isBoost = true;
			})
		}else{
			alert("Not enough coins to use boost.");
		}
	}

	toolPurchase(price){
		this.db.list('tools', ref=> ref.child(this.authUser))
  			.query.once('value').then(toolSnap =>{
  				let data = toolSnap.val();
  				let coinCount = data['coins'];
  				this.db.list('tools').update(this.authUser, {
  					coins: coinCount-price
  				});
  			});
	}

	getReward(){
		let modal = this.modalCtrl.create(UserRewardPage);
		modal.present();
	}

	returnCard(userID){
		var userCard;
		this.db.list('profile', ref => ref.child(userID)).query.once('value').then( snapshot =>{
			let data = snapshot.val()
			data['id'] = snapshot.key;
			data['age'] = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
			data = {...data, ...{
				likeEvent: new EventEmitter(),
  				destroyEvent: new EventEmitter(),
  				asBg: this.sanitizer.bypassSecurityTrustStyle('url('+data['photos'][0]+')')
			}};
			userCard = data;
		}).then(() =>{
			this.db.list('likes', ref => ref.child(userID).child(this.authUser))
				.query.once('value').then( snapshot =>{
					let data = snapshot.val();
					if(data){
						userCard['superlike'] = data['superlike'];
					}
				})
		}).then(() =>{
			this.stackedUsers.unshift(userCard);
		});
	}

	stackStart(){
		this.userList = [];		//refresh user list and cards if current user profile is changed
		this.stackedUsers = [];
		this.userLikerList = [];
		this.userSuperList = [];
		this.userBoostList = [];
		// this.cardObserver.forEach( subscription => {
		// 	subscription.unsubscribe();
		// });
		this.isReady = false; //loading of cards
		this.getUsers();
	}

	// cardSubscribe(){
	// 	this.cardObserver = [];
	// 	this.stackedUsers.forEach( (value, i) => {
	// 		//IF SUBSCRIPTIONS RUINS IT CHANGE THIS TO ONCE VALUE
	// 		this.cardObserver[i] = this.db.list('profile', ref => ref.orderByKey().equalTo(value.id))
	// 				.snapshotChanges().subscribe( snapshot =>{
	// 				//add a method that gets the index of a certain key if error
	// 				let index = this.stackedUsers.findIndex(x => x.id === snapshot[0].key);
	// 				this.stackedUsers[index] = snapshot[0].payload.val();	//apply observer/listener to user data
	// 				this.stackedUsers[index].id = snapshot[0].key;
	// 				this.stackedUsers[index].age = moment().diff(moment(this.stackedUsers[index].birthday, 
	// 					"MM/DD/YYYY"), 'years');
	// 				this.stackedUsers[index] = {...this.stackedUsers[index], ...{
	// 					likeEvent: new EventEmitter(),
	// 	  				destroyEvent: new EventEmitter(),
	// 	  				asBg: this.sanitizer.bypassSecurityTrustStyle('url('+this.stackedUsers[index].photos[0]+')')
	// 				}}
	// 			});
	// 	});		
	// }

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
								if(data.isVisible){		//check visibility
									this.userList.push(data);
								}
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
							if(element.key !== this.authUser){ //avoid getting self
								let data = element.val();
								data.id = element.key;
								data.age = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
								if(data.isVisible){		//check visibility
									this.userList.push(data);
								}
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
			this.filterByInterests();
			// this.filterByLocation();
		});
	}
	filterByInterests(){
		let newList = [];
		this.userList.forEach( (value, index) =>{
			let myInterests = Object.assign([], this.myProfile['interests']);
			let userInterests = Object.assign([], value['interests']);
			let sameInterest = myInterests.filter( item =>{
				return userInterests.indexOf(item) > -1;
			});
			if(sameInterest.length>0){
				let data = value;
				data['sameInterest'] = sameInterest;
				newList.push(data);
			}
		});
		this.userList = newList;
		this.filterByLocation();
	}
	filterByLocation(){
		let newList = [];
		let userLength = this.userList.length;
		var locationPromise = new Promise(resolve => {
			if(!(userLength > 0)){
				resolve(true);
			}
			this.userList.forEach( (value, index) =>{
				this.db.list('location', ref => ref.child(value['id']))
					.query.once('value').then( snapshot => {
						if(snapshot.val()){
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
						}
					}).then(() =>{
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
			if(!(userLength > 0)){
				resolve(true);
			}
			this.userList.forEach( (value, index) =>{
				this.db.list('profile', ref => ref.child(value['id']))
					.query.once('value').then( snapshot => {
						let data = snapshot.val();
						data.id = snapshot.key;
						let age = value.age;
						let ageRange = this.myProfile['ageRange'];	//age range preference of user
						var isInRange;
						if(ageRange.max < 50){
							isInRange = ((age >= ageRange.min && 
							age<=ageRange.max) ? true : false);	//check if in range of age preference
							if(isInRange){	//remove users not in range
								newList.push(value);
							}
						}
						else{
							isInRange = ((age >= ageRange.min) ? true : false);	//check if in range of age preference
							if(isInRange){	//remove users not in range
								newList.push(value);
							}
						}
					}).then(() =>{
						if(index+1 === userLength){
							resolve(true);
						}
					});
				});
		});
		agePromise.then(() => {
			this.userList = newList;
			this.filterByActive();
		});
	}
	filterByActive(){
		let newList = [];
		let userLength = this.userList.length;
		let activeTime = 604800000;	//week in milliseconds	//only active a week ago
		let dateNow = moment().valueOf();
		var activePromise = new Promise(resolve =>{
			if(!(userLength > 0)){
				resolve(true);
			}
			this.userList.forEach( (value, index) =>{
				this.db.list('activity', ref => ref.child(value.id))
					.query.once('value').then( activeSnap => {
						let data = activeSnap.val();
						if(data['isActive'].status){
							newList.push(value);
						}
						else{
							let isDateAgo = ((dateNow-data['isActive'].timestamp) < activeTime)? true: false;
							if(isDateAgo){
								newList.push(value);
							}
						}
					}).then(() =>{
						if(index+1 === userLength){
							resolve(true);
						}
					});
			});
		});
		activePromise.then(()=>{
			this.userList = newList;
			this.checkMatchStatus();
		});
	}
	checkMatchStatus(){
		let newList = [];
		let userLength = this.userList.length;
		var matchPromise = new Promise(resolve =>{
			if(!(userLength > 0)){
				resolve(true);
			}
			this.userList.forEach( (value, index) => {
				this.db.list('match', ref => ref.child(this.authUser).child(value.id))
				.query.once('value').then( matchSnap => {
					if(matchSnap.val() === null){
						newList.push(value);
					}
					if(index+1 === userLength){
						resolve(true);
					}
				})
			})
		});
		matchPromise.then(() =>{
			this.userList = newList;
			this.checkLikeStatus(newList);
		});
	}

	checkLikeStatus(userList){
		let newList = [];
		let userLength = userList.length;
		var likedPromise = new Promise(resolve =>{
			if(!(userLength > 0)){
				resolve(true);
			}
			userList.forEach( (value, index) => {
				this.db.list('likes', ref => ref.child(this.authUser).child(value.id))
				.query.once('value').then( likeSnap =>{
					if(likeSnap.val() !== null){	//if liked/unliked
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
					if(index+1 === userLength){
						resolve(true);
					}
				})
			})
		});
		likedPromise.then(() =>{
			this.userList = newList;
			this.checkDuplicates();
			
		});
	}
	listUsers(){	//listing users with higher chances
		let likerList = [];	//list of users who liked you
		let superList = [];	//list of users who superliked
		let boostList = [];	//list of users who superliked
		let userLength = this.userList.length;
		var likersPromise = new Promise(resolve =>{
			if(!(userLength > 0)){
				resolve(true);
			}
			this.userList.forEach( (value, index)=> {
				this.db.list('likes', ref => ref.child(value.id).child(this.authUser))
					.query.once('value').then( likeSnap =>{
						if(likeSnap.val()){
							let data = likeSnap.val();
							if(data.like){
								likerList.push(value);
								if(data.superlike){
									superList.push(value);
								}
							}
							// if(index+1 === userLength){
							// 	resolve(true);
							// }
						}
					}).then(() =>{
						this.db.list('tools', ref => ref.child(value.id))
							.query.once('value').then(toolSnap =>{
								let data = toolSnap.val();
								let dateNow = moment().valueOf();
								let userBoost = (dateNow-data['boost']) < this.boostEffect ? true : false;
								if(userBoost){
									boostList.push(value);
								}
							});
					}).then(() =>{
						if(index+1 === userLength){
							resolve(true);
						}
					});
			});
		});
		likersPromise.then(() =>{
			this.userLikerList = likerList;
			this.userSuperList = superList;
			this.userBoostList = boostList;
			// this.checkDuplicates();
			this.stackUser();
		});
	}

	checkDuplicates(){
		let newList = [];
		for(let i =0;i<this.userList.length;i++){
        if(newList.findIndex(item => item.id === this.userList[i]['id']) === -1) {
           	newList.push(this.userList[i]);
           }    
        }
        this.userList = newList;
        this.listUsers();
	}
	stackUser(){
		let numOfCards = ((this.userList.length<20) ? this.userList.length : 20);	//safety check if low count of users
		for(let i=0; i<numOfCards; i++){
			this.getCard();
		}
		if(numOfCards>0){
			setTimeout(()=>{    //<<<---    using ()=> syntax
				this.findUserCount = 0;
			    this.isReady = true;
			}, 2000);
		}
		else{
			setTimeout( () => {
				if(this.findUserCount !== 5){
					this.findUserCount++;	//findUserCount to check how many times the app looked for match; it notifies user to update interest
					this.stackStart();
				}
			}, 2000);
			//loop to find users again
		}
	}
	setCard(userID){
		var newUserCard;
		var stackPromise = new Promise( resolve => {
			this.db.list('profile', ref => ref.child(userID)).query.once('value').then( snapshot =>{
				newUserCard = snapshot.val();
				newUserCard['id'] = snapshot.key;
				newUserCard['age'] = moment().diff(moment(newUserCard['birthday'], "MM/DD/YYYY"), 'years');
				newUserCard = {...newUserCard, ...{
					likeEvent: new EventEmitter(),
	  				destroyEvent: new EventEmitter(),
	  				asBg: this.sanitizer.bypassSecurityTrustStyle('url('+newUserCard.photos[0]+')')
				}};
			}).then(() =>{
				this.db.list('likes', ref => ref.child(userID).child(this.authUser))
					.query.once('value').then( snapshot =>{
						let data = snapshot.val();
						if(data){
							newUserCard.superlike = data['superlike'];
						}
					})
			}).then(() =>{
				resolve(true);
			});
		});
		stackPromise.then(()=>{
			this.stackedUsers.push(newUserCard);
		})
	}
	getCard(){
		if(this.stackedUsers.length < 20){
			let data = true;
			while(data){
				let percent = this.getRandomInt(0, 100);
				if(percent < 20){
					data = this.getFromLikers();
				}
				else if(percent < 60){
					data = this.getFromBoosters();
				}
				else if(percent < 80){
					data = this.getFromSupers();
				}
				else{
					data = this.getFromList();
				}
			}
		}
	}
	getFromLikers(){	//get in list of users who liked you
		if(this.userLikerList.length > 0){
			let num = this.getRandomInt(0, this.userLikerList.length);	
			this.setCard(this.userLikerList[num]['id']);
			this.removeFromLists(this.userLikerList[num]['id']);
			return false;
		}
		else{
			return true;
		}
	}
	getFromBoosters(){	//only get in normal retrieved list
		if(this.userBoostList.length>0){
			let num = this.getRandomInt(0, this.userBoostList.length);
			this.setCard(this.userBoostList[num]['id']);
			this.removeFromLists(this.userBoostList[num]['id']);
			return false;
		}else{
			return true
		}
	}
	getFromSupers(){	//only get in normal retrieved list
		if(this.userSuperList.length > 0){
			let num = this.getRandomInt(0, this.userSuperList.length);
			this.setCard(this.userSuperList[num]['id']);
			this.removeFromLists(this.userSuperList[num]['id']);
			return false;
		}else{
			return true;
		}
	}
	getFromList(){	//only get in normal retrieved list
		let num = this.getRandomInt(0, this.userList.length);
		this.setCard(this.userList[num]['id']);
		this.removeFromLists(this.userList[num]['id']);
		return false;
	}
	removeFromLists(removeID){	//removes a value from all the list retrieved
		let userListIndex = this.userList.findIndex(item => item['id'] === removeID);
		let likerListIndex = this.userLikerList.findIndex(item => item['id'] === removeID);
		let superListIndex = this.userSuperList.findIndex(item => item['id'] === removeID);
		let superBoostIndex = this.userBoostList.findIndex(item => item['id'] === removeID);
		this.userList.splice(userListIndex, 1);
		this.userLikerList.splice(likerListIndex, 1);
		this.userSuperList.splice(superListIndex, 1);
		this.userBoostList.splice(superBoostIndex, 1);
	}
	report_user(){
		const report = this.modalCtrl.create(UserReportPage);
		report.present();
	}	
	checkInfo(cardIndex){
		const check = this.modalCtrl.create(UserCheckPage, {user:this.stackedUsers[cardIndex]});
		check.present();
	}

	getRandomInt(min, max) {	//sample to keep cards going
	    min = Math.ceil(min);
	    max = Math.floor(max);
	    return Math.floor(Math.random() * (max - min)) + min;
	}
	updateProfile(){
		this.navCtrl.push(UserEditPage);
	}
	swiped(){
		this.hideMe = !this.hideMe;
		this.show=!this.show;
	}
	show_div(){
		this.hideMe=!this.hideMe;
		this.show=!this.show;
	}
}