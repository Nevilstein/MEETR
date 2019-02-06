import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ModalController } from 'ionic-angular';

//Pages
import { UserTabsPage } from '../../user/user-tabs/user-tabs';
import { LoginPage } from '../../login/login';
import { UserInterestPage } from '../user-interest/user-interest';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the UserFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-form',  
  templateUrl: 'user-form.html',
})
export class UserFormPage {
  profile = this.navParams.get('profile');
  authKey = this.authProvider.authUser;

  next: boolean = true;
  back: boolean = false;
  isMale: boolean = true;
  isFemale: boolean = false;
  interests = [];
  interestInputValue;

  @ViewChild(Slides) slides: Slides;
  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, 
    public fireAuth: AngularFireAuth,private modalCtrl: ModalController, private zone: NgZone, private authProvider: AuthProvider) {
    console.log(this.profile);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserFormPage');
    this.slides.lockSwipes(true);
  }
  toggleFemale() {
    this.isMale = !this.isFemale;
  }
  toggleMale() {
    this.isFemale = !this.isMale;
  }
  gotoNext(){
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slides.lockSwipes(true);
    this.back = true;
    // this.slideMoved(this.slides.getActiveIndex());
  }
  goPrev(){
    this.slides.lockSwipes(false);
    this.slides.slidePrev();
    this.slides.lockSwipes(true);
    // this.slideMoved(this.slides.getActiveIndex());
  }

  formFinished(){
    var formProfile = {
      gender: {
        male: this.isMale,
        female: this.isFemale
      },
      interests: this.interests,
      showGender:{
        male: !this.isMale,
        female: !this.isFemale
      }
    }
    this.profile = Object.assign({}, this.profile, formProfile);
    this.db.list('profile').update(this.authKey, this.profile);
    this.db.list('tools').update(this.authKey, {
      likes:{
        limit:10,
        timestamp:firebase.database.ServerValue.TIMESTAMP
      },
      question:{
        timestamp:0
      },
      boost: 0,  //starting timestamp for boost
      dailyReward: 0, //starting timestamp for daily reward
      coins: 0
    });
    this.zone.run(() => {
        this.navCtrl.setRoot(UserTabsPage);
    });
  }

  addInterest(interest){
    // console.log(this.interestInput._value);
    // this.interestInput.clearTextInput();
    this.interests.push(interest);
    this.interestInputValue = null;
  }
  deleteInterest(interestNumber){
    this.interests.splice(interestNumber, 1);
  }
  clearInterest(){
    this.interests = [];
  } 
  // slideMoved(slideIndex){
  //   switch(slideIndex) {
  //     case 0 :{  //Gender
        
  //       break;
  //     }
  //     case 1:{  //Interest
  //       if(this.interest1 && this.interest2 && this.interest3){
  //         this.next = true;
  //       }
  //       else{
  //         this.next = false;
  //       }
  //       break;
  //     }
  //   }
  // }
  editInterest(){
    let modal = this.modalCtrl.create(UserInterestPage);
    modal.present();
  }
}
