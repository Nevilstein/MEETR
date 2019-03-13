import { Component } from '@angular/core';
import { IonicPage, NavController,ViewController, NavParams } from 'ionic-angular';

//Plugin
import moment from 'moment';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { MomentProvider } from '../../../providers/moment/moment';
/**
 * Generated class for the UserViewMomentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-view-moment',
  templateUrl: 'user-view-moment.html',
})
export class UserViewMomentPage {
	momentDetails = this.momentProvider.currentMoment;
  userKey = this.momentProvider.userKey;
  authKey = this.authProvider.authUser;
	date;
	image;
	caption;
  constructor(public navCtrl: NavController, public navParams: NavParams, public momentProvider: MomentProvider, public authProvider: AuthProvider,
    public db: AngularFireDatabase, public view:ViewController) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserViewMomentPage');
    this.date = moment(this.momentDetails.timestamp).format('dddd MM/DD/YY HH:mm');
  	this.image = this.momentDetails.image;
  	this.caption = this.momentDetails.caption;
  }

  deleteMoment(momentId){
    this.db.list('moments', ref=> ref.child(this.userKey)).update(momentId, {
      status: false
    }).then(()=>{
      this.navCtrl.pop();
    });
  }
  closeModal(){
    this.view.dismiss();
  }

}
