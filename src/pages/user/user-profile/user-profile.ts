import { Component, ViewChild, ViewChildren, NgZone, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

//Pages
import { LoginPage } from '../../login/login';
import { UserEditPage } from '../user-edit/user-edit';
import { UserTabsPage } from '../user-tabs/user-tabs';
import { UserSettingPage } from '../user-setting/user-setting';

//Plugin
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
// import { Observable } from 'rxjs';
import moment from 'moment';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { UserProvider } from '../../../providers/user/user';
/**
 * Generated class for the UserProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @ViewChild('interestInput') interestInput: ElementRef;


@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  //Elements
  // @ViewChild("interestInput") interestInput: ElementRef;
  // @ViewChildren("interestItem") interestItems: ElementRef;

  //Display variables
  // profile = {};

  authUser = this.authProvider.authUser;  //ID of authenticated user

  //Observer/Subscription
  profileObserver;

  //Variables
  firstName: string;
  age: number;
  image: string;
  bio: string;
  interests = [];

  //Element variables
  interestInputValue: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public fb:Facebook, private fireAuth: AngularFireAuth,
    private db: AngularFireDatabase, private zone: NgZone, private authProvider: AuthProvider, 
    private userProvider: UserProvider) {
  }
  ionViewDidLoad() {
    this.loadProfile();
  }
  ionViewWillUnload(){
    this.profileObserver.unsubscribe();
  }

  loadProfile(){
    this.profileObserver = this.db.list('profile', ref => ref.orderByKey().equalTo(this.authUser))
      .snapshotChanges().subscribe( snapshot => {  //Angularfire2 
        var data = snapshot[0].payload.val();
        this.firstName = data['firstName'];
        this.age = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
        this.image = data['photos'][0];
        this.bio = data['bio'];
        this.interests = Object.assign([], data['interests']);
      });
  }
  
  goToEdit(){
    this.navCtrl.push(UserEditPage);
  }
  goToSetting(){
    this.navCtrl.push(UserSettingPage);
  }

}
