import { Component,EventEmitter  } from '@angular/core';
import { IonicPage, NavController, NavParams ,ModalController} from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';

//Pages
import { UserReportPage } from '../user-report/user-report';
import { UserCheckPage } from '../user-check/user-check';

//Libraries
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import geolib from 'geolib';
import moment from 'moment';
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
	  superlike:{
	  	backgroundColor: '#0080FF'
	  }
	};

	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, private modal: ModalController, 
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
		this.getLocation();
		this.stackStart();
	}


	onCardInteract(event){	//add swiped user id for the match database
   		// console.log(event);
   		// ADD AGE TO ALL STACKED USERS
   		//ADD UPDATE TO MATCH DATABASE => userid: boolean, date and cooldown if disliked
   		//REMOVE SUBSCRIPTION OF 
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
	   			},1000);	//1 seconds refresh
	   		}
	   	}
  //  		this.stackedUsers.push({
		// likeEvent: new EventEmitter(),
		// destroyEvent: new EventEmitter(),
		// asBg: this.sanitizer.bypassSecurityTrustStyle('url('+this.images[i]+')')
		// });
	}

	getNewCard(){
		let num = this.getRandomInt(0,this.userList.length);
		let newUserCard = this.userList[num];
		this.userList.splice(num,1);	//remove from userList
		this.db.list('profile', ref => ref.orderByKey().equalTo(newUserCard['id']))
			.snapshotChanges().subscribe(snapshot => {
				let data = snapshot[0].payload.val();	//apply observer/listener to user data
				data["id"] = snapshot[0].key;
				data = {...data, ...{
					likeEvent: new EventEmitter(),
	  				destroyEvent: new EventEmitter(),
	  				asBg: this.sanitizer.bypassSecurityTrustStyle('url('+data['photos'][0]+')')
				}};
				newUserCard = data;
			});

		console.log(this.stackedUsers);
	}

	setCards(){
		var stackPromise = new Promise( resolve => {
			let userCount = 0;
			// console.log(this.stackedUsers.length);
			this.stackedUsers.forEach( (value, index) => {
				this.db.list('profile', ref => ref.orderByKey().equalTo(value.id)).snapshotChanges().subscribe(snapshot => {
					console.log(index);
					//add a method that gets the index of a certain key if error
					this.stackedUsers[index] = snapshot[0].payload.val();	//apply observer/listener to user data
					this.stackedUsers[index].id = snapshot[0].key;
					this.stackedUsers[index] = {...this.stackedUsers[index], ...{
						likeEvent: new EventEmitter(),
		  				destroyEvent: new EventEmitter(),
		  				asBg: this.sanitizer.bypassSecurityTrustStyle('url('+this.stackedUsers[index].photos[0]+')')
					}}
					if(index === this.stackedUsers.length-1){		
						resolve(true);
					}
				});
			});
		});
		stackPromise.then(()=>{
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
					.equalTo(true)).query.once('value', snapshot =>{
						snapshot.forEach( element =>{
							if(element.key !== this.fireAuth.auth.currentUser.uid){	//avoid getting self
								let data = element.val();
								data.id = element.key;
								this.userList.push(data);
							}
						});
						resolve(true);
					})
			}
		});
		var femalePromise = new Promise(resolve => {
			if(this.myProfile['showGender'].female){
				this.db.list('profile', ref => ref.orderByChild('gender/female')
					.equalTo(true)).query.once('value').then( snapshot => {
						snapshot.forEach(element =>{
							if(element.key !== this.fireAuth.auth.currentUser.uid){ //avoid getting self
								let data = element.val();
								data.id = element.key;
								this.userList.push(data);
							}
						});
						resolve(true);
					});
			}
		});
		Promise.all([malePromise, femalePromise]).then( users => {	//wait to retrieve userbyGender promise to get values
			this.filterByLocation();
		});
	}
	filterByLocation(){
		let userCount = 0;
		let userLength = this.userList.length;
		var locationPromise = new Promise(resolve => {
			this.userList.forEach( (value, index) =>{
				this.db.list('location', ref => ref.orderByKey().equalTo(value['id']))
					.query.once('value').then( snapshot => {
						let data:any;
						snapshot.forEach(element =>{
							data = element.val();
							data.id = element.key;
						});
						console.log(value['id'], index);
						let myPoint = {
							latitude: data['currentLocation'].latitude,
							longitude: data['currentLocation'].longitude
						}
						let otherPoint ={
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
			this.filterByAge();
		});
	}

	filterByAge(){
		let userCount = 0;
		let userLength = this.userList.length;
		var agePromise = new Promise(resolve => {
			this.userList.forEach( (value, index) =>{
				this.db.list('profile', ref => ref.orderByKey().equalTo(value['id']))
					.query.once('value').then( snapshot => {
						let data:any;
						snapshot.forEach(element =>{
							data = element.val();
							data.id = element.key;
						});
						let age = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
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
			})
		});
		agePromise.then(() => {
			this.stackUser();
		});
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
		const report = this.modal.create(UserReportPage);
		report.present();
	}	
	check_user(){
		const check = this.modal.create(UserCheckPage);
		check.present();
	}

	getRandomInt(min, max) {	//sample to keep cards going
	    min = Math.ceil(min);
	    max = Math.floor(max);
	    return Math.floor(Math.random() * (max - min)) + min;
	}

	match_overlay(){
		const match = this.modal.create(UserMatchPage);
		match.present();
	}
}