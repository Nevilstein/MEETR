import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';


//Pages
import { UserViewMomentPage } from '../user-view-moment/user-view-moment';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';

//Providers
import { CheckProvider } from '../../../providers/check/check';
import { MomentProvider } from '../../../providers/moment/moment';
/**
 * Generated class for the UserMomentsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-moments',
  templateUrl: 'user-moments.html',
})
export class UserMomentsPage {

  userKey = this.checkProvider.profile.id;
  profile = this.checkProvider.profile;
  moments = [];
  isMatched = this.checkProvider.isMatched;

  //Observer/Subscription
  momentObserver;
  constructor(public navCtrl: NavController, public navParams: NavParams, public checkProvider: CheckProvider,
    public momentProvider: MomentProvider, public db: AngularFireDatabase, public modalCtrl: ModalController) {
    this.moments = this.checkProvider.moments;
    if(!this.isMatched && this.moments.length>6){
      this.moments.splice(6);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserMomentsPage');
    this.getMoments();
  }
  ionViewWillUnload(){
    this.momentObserver.unsubscribe();
  }
  getMoments(){
    this.momentObserver = this.db.list('moments', ref => ref.child(this.userKey).orderByChild('timestamp'))
      .snapshotChanges().subscribe( snapshot => {
        let reverseSnap = snapshot.slice().reverse();
        let allMoments = [];
        reverseSnap.forEach( element =>{
          let data = element.payload.val();
          data['id'] = element.key;
          data['date'] = moment(data['timestamp']).format('MMMM DD, YYYY');
          if(data['status']){
            allMoments.push(data);
          }
        });
        this.moments = allMoments;
        if(!this.isMatched && this.moments.length>6){
          this.moments.splice(6);
        }
      });
  }
  seeMoment(momentDetails){
    this.momentProvider.currentMoment = momentDetails;
    let modal = this.modalCtrl.create(UserViewMomentPage);
    modal.present();
  }
}
