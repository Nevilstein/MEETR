import { Component, ViewChild, ViewChildren, NgZone, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

//Pages
import { LoginPage } from '../../login/login';
import { UserEditPage } from '../user-edit/user-edit';
import { UserTabsPage } from '../user-tabs/user-tabs';
import { UserSettingPage } from '../user-setting/user-setting';
import { UserProfileMomentsPage } from '../user-profile-moments/user-profile-moments';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
// import { Observable } from 'rxjs';
import moment from 'moment';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { UserProvider } from '../../../providers/user/user';
import { MomentProvider } from '../../../providers/moment/moment';
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
  momentObserver;
  // likeObserver;

  //Variables
  firstName: string;
  age: number;
  image: string;
  bio: string;
  gender = {};
  interests = [];
  moments = [];

  //Element variables
  interestInputValue: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public fb:Facebook, private fireAuth: AngularFireAuth,
    private db: AngularFireDatabase, private zone: NgZone, private authProvider: AuthProvider, 
    private userProvider: UserProvider, private momentProvider:MomentProvider) {
  }
  ionViewWillLoad() {
    this.loadProfile();
  }
  ionViewWillUnload(){
    this.profileObserver.unsubscribe();
    this.momentObserver.unsubscribe();
  }

  loadProfile(){
    this.profileObserver = this.db.list('profile', ref => ref.orderByKey().equalTo(this.authUser))
      .snapshotChanges().subscribe( snapshot => {  //Angularfire2 
        var data = snapshot[0].payload.val();
        data['id'] = snapshot[0].key;
        this.firstName = data['firstName'];
        this.age = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
        this.gender = data['gender'];
        this.image = data['photos'][0];
        this.bio = data['bio'];
        this.interests = Object.assign([], data['interests']);
        this.userProvider.authProfile = data;
      });
    this.momentObserver = this.db.list('moments', ref => ref.child(this.authUser).orderByChild('timestamp'))
      .snapshotChanges().subscribe( snapshot => {
        let reverseSnap = snapshot.slice().reverse();
        let allMoments = [];
        reverseSnap.forEach( element =>{
          let data = element.payload.val();
          data['id'] = element.key;
          data['date'] = moment(data['timestamp']).format('MMM DD');
          if(data['status']){
            allMoments.push(data);
          }
        });
        this.moments = allMoments;
        this.userProvider.myMoments = allMoments;
      });
  }
  // getLikes(){
  //   this.likeObserver = this.db.list('likes')
  // }
  seeMoments(){
    this.momentProvider.userKey = this.authUser;
    this.navCtrl.push(UserProfileMomentsPage);
  }
  goToEdit(){
    this.navCtrl.push(UserEditPage);
  }
  goToSetting(){
    this.navCtrl.push(UserSettingPage);
  }

}
