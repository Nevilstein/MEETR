import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the UserCheckPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-check',
  templateUrl: 'user-check.html',
})
export class UserCheckPage {

  authKey = this.authProvider.authUser;

  userInfo = this.navParams.get('user'); 
  userKey;
  userPhotos = [];
  userInterests = [];
  userFirstName;
  userBio;
  userAge;
  constructor(public navCtrl: NavController, public navParams: NavParams,private view: ViewController, 
    private db: AngularFireDatabase, private fireAuth: AngularFireAuth, private authProvider: AuthProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserCheckPage');
    console.log(this.userInfo);
    this.getProfile();
  }
  getProfile(){
    this.userKey = this.userInfo.id;
    this.userPhotos = this.userInfo.photos;
    this.userInterests = this.userInfo.interests;
    this.userFirstName = this.userInfo.firstName;
    this.userAge = this.userInfo.age;
    this.userBio = this.userInfo.bio;
    // this.db.list('profile', ref=> ref.orderByKey().equalTo(this.userKey))
  }
  close_modal(){
    this.view.dismiss();
  }

}
