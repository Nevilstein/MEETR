import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ModalController } from 'ionic-angular';

//Pages
import { UserTabsPage } from '../../user/user-tabs/user-tabs';
import { LoginPage } from '../../login/login';
import { FormInterestPage } from '../form-interest/form-interest';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { Diagnostic } from '@ionic-native/diagnostic';
import { LocationAccuracy } from '@ionic-native/location-accuracy';

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
  isInterest: boolean = false;
  isLocation: boolean = false;
  isEnd: boolean = false;
  slideIndex: number = 0;
  interests = [];

  // interestInputValue;
  locationChecker;

  @ViewChild(Slides) slides: Slides;
  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, 
    public fireAuth: AngularFireAuth,private modalCtrl: ModalController, private zone: NgZone, 
    private authProvider: AuthProvider, private diagnostic: Diagnostic, private locationAcc: LocationAccuracy){
    console.log(this.profile);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserFormPage');
    this.slides.lockSwipes(true);
  }
  ionViewWillUnload(){

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
    this.slideChanged();
  }
  goPrev(){
    this.slides.lockSwipes(false);
    this.slides.slidePrev();
    this.slides.lockSwipes(true);
    this.slideChanged();
  }

  slideChanged(){
    this.slideIndex = this.slides.getActiveIndex();  
    if(this.slideIndex === 2){
      this.checkLocation();
      this.locationChecker = setInterval(() =>{
        this.checkLocation();
      },1000);
    }
    else{
      if(this.locationChecker){
        clearInterval(this.locationChecker);
      }
    }
    
  }
  checkLocation(){
    this.diagnostic.isLocationEnabled().then( isAvailable =>{
      if(isAvailable){
        this.isLocation = true;
      }else{
        this.locationAcc.request(this.locationAcc.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            this.isLocation = true;
          },
          error => {
            if(error.code === 4){
              this.isLocation = false;
            }
          });
      }
    }).catch( error =>{
      console.log(error);
    })
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

  seeInterests(){
    let model = this.modalCtrl.create(FormInterestPage, {interests: this.interests});
    model.present();
    model.onDidDismiss( data => {
      this.interests = data.interests
    });
  }
}
