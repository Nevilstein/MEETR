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
  constructor(public navCtrl: NavController, public navParams: NavParams,private view: ViewController, 
    private db: AngularFireDatabase, private fireAuth: AngularFireAuth, private authProvider: AuthProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserCheckPage');
    this.getProfile();
  }
  getProfile(){
    // this.db.list('profile', ref=> ref.child())
  }
  close_modal(){
    this.view.dismiss();
  }

}
