import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App,ToastController  } from 'ionic-angular';

//Pages
import { UserProfilePage } from '../user-profile/user-profile';
import { UserTutorialPage} from '../user-tutorial/user-tutorial';
import { UserAllTutorialPage} from '../user-all-tutorial/user-all-tutorial';
import { LoginPage } from '../../login/login';

//Plugin
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import moment from 'moment';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import firebase from 'firebase';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { UserProvider } from '../../../providers/user/user';
/**
 * Generated class for the UserSettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-setting',
  templateUrl: 'user-setting.html',
})
export class UserSettingPage {

  authUser = this.authProvider.authUser;
  //Observer/Subscription
  profileObserver;

  //Variables
  maxDistance: number;
  ageRange = {};
  showGender = {};
  userVisible: boolean;
  showMoments: boolean;

  constructor(public navCtrl: NavController,public toastCtrl: ToastController, public navParams: NavParams, private fireAuth: AngularFireAuth, 
    private fb: Facebook, private db: AngularFireDatabase, private appCtrl: App, private authProvider: AuthProvider,
    private userProvider: UserProvider) {
 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserSettingPage');
    this.loadSetting();
  }
  ionViewWillUnload(){
    this.profileObserver.unsubscribe();
  }

  goBack(){
    this.navCtrl.pop();
  }
  
  loadSetting(){
    this.profileObserver = this.db.list('profile', ref => ref.orderByKey().equalTo(this.authUser))
      .snapshotChanges().subscribe(snapshot =>{
        var data = snapshot[0].payload.toJSON();
        this.maxDistance = data['maxDistance'];
        this.ageRange = {
          lower: data['ageRange'].min,
          upper: data['ageRange'].max
        };
        this.showGender = {
          male: data['showGender'].male,
          female: data['showGender'].female
        };
        this.userVisible = data['isVisible'];
        this.showMoments = data['showMoments'];
      });
  }

  facebookLogout(){
    this.fb.logout().then( res => {  //signout fb
      this.db.list('profile').update(this.authUser, {
          isLoggedIn: false
      }).then(() => {
        this.db.list('activity').update(this.authUser, {  //start with active
          isActive:{
            status: false,
            timestamp: firebase.database.ServerValue.TIMESTAMP
          }
        }).then(() =>{
          this.fireAuth.auth.signOut();
          alert("Logged out.");
          this.appCtrl.getRootNav().setRoot(LoginPage);
        });
      });
    });
  }

  // sliderChanged(){
    
  // }

  saveSetting(){
    this.db.list('profile').update(this.authUser, {
        maxDistance: this.maxDistance,
        showGender: this.showGender,
        ageRange: {min:this.ageRange['lower'], max:this.ageRange['upper']},
        isVisible: this.userVisible,
        showMoments: this.showMoments
    }).then( () =>{
      const toast = this.toastCtrl.create({
        message: 'Your settings were successfully saved',
        duration: 1000,
        position: 'bottom'
      });
      toast.present();
      this.goBack();
    });
  }

  showMaleChanged(){
    if(!this.showGender['male'] && !this.showGender['female']){
      this.showGender['female'] = true;
    }
  }

  showFemaleChanged(){
    if(!this.showGender['male'] && !this.showGender['female']){
      this.showGender['male'] = true;
    }
  }

  go_tutorial(){
    this.navCtrl.push(UserTutorialPage);
  }
  go_firsttutorial(){
    this.navCtrl.push(UserAllTutorialPage);
  }
}
