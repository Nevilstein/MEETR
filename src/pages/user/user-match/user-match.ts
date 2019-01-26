import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

/**
 * Generated class for the UserMatchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-match',
  templateUrl: 'user-match.html',
})
export class UserMatchPage {
  userLikedKey = this.navParams.get('userMatchKey');
  userImage: string;
  userLikedImage: string;
  userLikedName: string;
  constructor(public navCtrl: NavController, public navParams: NavParams ,private view: ViewController, 
    private db: AngularFireDatabase, private fireAuth: AngularFireAuth) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserMatchPage');
    this.getUserData();
    this.getLikedData();
  }

  //add a promise and ready variable to make sure that userData and userLikedData is retrieved before loading modal

  getUserData(){
    this.db.list('profile', ref => ref.child(this.fireAuth.auth.currentUser.uid))
      .query.once('value').then(snapshot => {
        this.userImage = snapshot.val().photos[0];
      });
  }

  getLikedData(){
    this.db.list('profile', ref => ref.child(this.userLikedKey))
      .query.once('value').then( snapshot => {
        let data = snapshot.val();
        this.userLikedImage = data.photos[0];
        this.userLikedName = data.firstName;  //change to first name next, also change name to first name and last name in login
      });
  }

  chatStart(){
    //move to chat index in tab?
    //push chatbox page with key params
  }

  keep_swiping(){
    this.view.dismiss();
  }

}
