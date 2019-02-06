import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';

//Provider
import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the FormInterestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-form-interest',
  templateUrl: 'form-interest.html',
})
export class FormInterestPage {

	allInterests = [];
	selectedInterests = []
	interestList = [];
	interestdb = []
	interestValue: string;
	backupSelect = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, private view: ViewController, 
  	private db: AngularFireDatabase, private authProvider: AuthProvider, private toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FormInterestPage');
    this.selectedInterests = this.navParams.get('interests');
    this.getInterestsdb();
  }

  getInterestsdb(){
    this.db.list('interests', ref=> ref.orderByValue()).query.once('value').then(snapshot =>{
      snapshot.forEach(element => {
        let data = element.val();
        this.interestdb.push(data);
      });
    }).then(()=>{
      this.getInterests();
    })
  }

  getInterests(){
  	this.allInterests = this.selectedInterests.concat(this.interestdb);  //add interests shown in option
    this.allInterests = this.removeDuples(this.allInterests);
    this.filterInterest();
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
  }

  addCustomInterest(){
    let selectIndex = this.selectedInterests.indexOf(this.interestValue);  //index in selected interests
    let allIndex = this.allInterests.indexOf(this.interestValue);  //if found in all interest
    console.log(allIndex);
  	if(this.interestValue.trim() == ''){
  		return
  	}
  	if(this.selectedInterests.length <=10){
      if(selectIndex < 0){
        if(allIndex < 0){
          this.allInterests.unshift(this.interestValue);
        }
        this.selectedInterests.push(this.interestValue);
        this.backupSelect.push(this.interestValue);
      }
  	}
  	else{
  		let toast = this.toastCtrl.create({
          message: "You have reached the maximum number of interests(10)",
          duration: 1000,
          position: 'bottom'
        });
        toast.present();
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
		let valueIndex = this.selectedInterests.indexOf(value);
		this.selectedInterests.splice(valueIndex, 1);
  	}
  	this.filterInterest();
  }

  enterInterests(){
  	if(this.selectedInterests.length>=3){
  		this.view.dismiss({interests: this.selectedInterests})
  	}else{
  		let toast = this.toastCtrl.create({
          message: "You must have at least three interest",
          duration: 1000,
          position: 'bottom'
        });
        toast.present();
  	}
  	
  }
}
