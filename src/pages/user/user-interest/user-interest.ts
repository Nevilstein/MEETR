import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';


//Plugin
import { AngularFireDatabase } from 'angularfire2/database';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the UserInterestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-interest',
  templateUrl: 'user-interest.html',
})
export class UserInterestPage {
	authUser = this.authProvider.authUser;

	allInterests = [];	//all interests including selected
	selectedInterests = [];	//selected interests including from profile db
	interestList =[];  //list of interest that must be in database
	interestdb =[];  //list of interest that must be from interest collection database
	interestValue: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController,
  	private db: AngularFireDatabase, private authProvider: AuthProvider, private toastCtrl: ToastController) {
  	this.interestdb = ['Aesthetic', 'Animals', 'Anime & Manga', 'Art', 'Beauty', 'Books',
      'Esports', 'Fashion', 'Food', 'Health & Fitness', 'Horror', 'Kpop/K-Drama', 'LGBTQ+',
      'Movies', 'Music', 'Science', 'Travel', 'TV & Web-Series', 'Video Games', 'Writing'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserInterestPage');
    this.getInterests();
    //function to get category list in db
    
  }

  getInterests(){
  	this.db.list('profile', ref => ref.child(this.authUser))
  		.query.once('value', snapshot => {
  			let data = snapshot.val()
  			this.selectedInterests = Object.assign([], data['interests']);
	        this.allInterests = this.selectedInterests.concat(this.interestdb);  //add interests shown in option
	        this.allInterests = this.removeDuples(this.allInterests);
	        this.filterInterest();
  		});
  }

  removeDuples(interests){
    let newList = [];
    interests.forEach( element =>{
      if(!(newList.indexOf(element) > -1)){
        newList.push(element);
      }
    });
    return newList;
  }
  filterInterest(){
  	this.interestList = [];
  	this.allInterests.forEach( interest =>{
  		if(this.selectedInterests.indexOf(interest) > -1){
  			this.interestList.push({
  				name: interest,
  				isSelected: true
  			});
  		}
  		else{
  			this.interestList.push({
  				name: interest,
  				isSelected: false
  			});
  		}
  	});
  	console.log(this.interestList);
  }

  addCustomInterest(){
  	if(this.interestValue.trim() == ''){
  		return
  	}
  	if(this.selectedInterests.length <=10){
	  	this.allInterests.unshift(this.interestValue);
	  	this.selectedInterests.push(this.interestValue);
	}
	else{
		alert("You have reached the maximum number of interests(10).");
	}
  	this.filterInterest();
  	this.interestValue = '';
  }

  selectInterest(event, value){
  	let maxCount = 10;
  	if(event.checked){
  		if(this.selectedInterests.length <= maxCount){
  			this.selectedInterests.push(value);
  		}
  		else{
        let toast = this.toastCtrl.create({
          message: "You have reached the maximum number of interests(10)",
          duration: 1000,
          position: 'bottom'
        });
        toast.present();
  		}
  	}
  	else{
  		if(this.selectedInterests.length >1){
  			let valueIndex = this.selectedInterests.indexOf(value);
  			this.selectedInterests.splice(valueIndex, 1);
  		}
  		else{
        let toast = this.toastCtrl.create({
          message: "You must have at least one interest",
          duration: 1000,
          position: 'bottom'
        });
        toast.present();
  		}
  		
  	}
  	this.filterInterest();
  }
  cancel(){
  	this.viewCtrl.dismiss();
  }
  updateInterest(){
  	this.db.list('profile').update(this.authUser, {interests: this.selectedInterests})
  	this.viewCtrl.dismiss();
  }


}
