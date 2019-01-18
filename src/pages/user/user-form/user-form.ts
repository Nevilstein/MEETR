import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';

//Pages
import { UserTabsPage } from '../../user/user-tabs/user-tabs';
import { LoginPage } from '../../login/login';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

//Providers
import { UserProvider } from '../../../providers/user/user';
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
  next: boolean = true;
  back: boolean = false;
  isMale: boolean = true;
  isFemale: boolean = false;
  interest1: string;
  interest2: string;
  interest3: string;

  @ViewChild(Slides) slides: Slides;
  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, 
    public fireAuth: AngularFireAuth, private zone: NgZone) {
    console.log(this.profile);
    // if(this.interest1){
    //   console.log(1);
    // }
    // else{
    //   console.log(2);
    // }
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
      interests:[
      this.interest1,
      this.interest2,
      this.interest3],
      showGender:{
        male: !this.isMale,
        female: !this.isFemale
      }
    }
    this.profile = Object.assign({}, this.profile, formProfile);
    this.db.list('profile').update(this.fireAuth.auth.currentUser.uid, this.profile).then( () => {
      this.zone.run(() => {
          this.navCtrl.setRoot(UserTabsPage);
      });
    });
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
}
