import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

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
	allInterests = this.navParams.get('interests');
	selectedInterests = this.navParams.get('myInterests');
	interestList = [];
	interestValue: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserInterestPage');
    this.filterInterest();
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
  }

  addCustomInterest(){
  	if(this.interestValue.trim() == ''){
  		return
  	}
  	// this.interestList.unshift({
  	// 	name: this.interestValue,
  	// 	isSelected: true
  	// });
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
  			alert("You have reached the maximum number of interests(10).");
  		}
  	}
  	else{
  		if(this.selectedInterests.length >0){
  			let valueIndex = this.selectedInterests.indexOf(value);
  			this.selectedInterests.splice(valueIndex, 1);
  		}
  		else{
  			alert("You must have at least one interest.");
  		}
  		
  	}
  	this.filterInterest();
  }
  cancel(){
  	this.viewCtrl.dismiss();
  }
  updateInterest(){
  	console.log(2);
  }


}
