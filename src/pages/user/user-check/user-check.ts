import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';

//Pages
import { UserReportPage } from '../user-report/user-report';
//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import moment from 'moment';
import geolib from 'geolib';

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
  userKey = this.userInfo.id;
  userPhotos = this.userInfo.photos;
  userInterests = this.userInfo.interests;
  userFirstName = this.userInfo.firstName;
  userBio = this.userInfo.bio;
  userAge = this.userInfo.age;
  distanceAway;
  activeWhen;
  sameInterests = [];
  questions = [];

  isEmptyBio = (this.userBio.trim('') === '') ? true: false;
  quizDuration = 7*86400000; //7 days in milliseconds is the duration of all questions
  //Observers/Subscribers
  profileObserver;
  distanceObserver;
  activeObserver;
  constructor(public navCtrl: NavController, public navParams: NavParams,private view: ViewController, 
    private db: AngularFireDatabase, private fireAuth: AngularFireAuth, private authProvider: AuthProvider,
    private modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserCheckPage');
    this.getProfile();
    this.getDistance();
    this.getActiveStatus();
    this.getQuestions();
    this.activeObserver = setInterval(() =>{
      this.getActiveStatus();
    }, 60000);
  }
  ionViewWillUnload(){
    this.profileObserver.unsubscribe();
    this.distanceObserver.unsubscribe();
    clearInterval(this.activeObserver);
  }
  getProfile(){
    
    this.profileObserver = this.db.list('profile', ref=> ref.orderByKey().equalTo(this.userKey))
      .snapshotChanges().subscribe(snapshot => {
        snapshot.forEach( element => {
          let data = element.payload.val();
          data['id'] = element.key;
          this.userKey = this.userInfo.id;
          this.userPhotos = data['photos'];
          this.userInterests = data['interests'];
          this.userFirstName = data['firstName'];
          this.userAge = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
          this.userBio = data['bio'];
          this.isEmptyBio = (this.userBio.trim('') === '') ? true: false;
        });
      });
    this.getMutualInterest();
  }
  getDistance(){
    this.distanceObserver = this.db.list('location', ref => ref.child(this.authKey))
      .snapshotChanges().subscribe( snapshot =>{
        var data, userData;
        snapshot.forEach( element => {
          data = element.payload.val();
          data['coordinates'] = {
            latitude: data.latitude,
            longitude: data.longitude,
          }
          this.db.list('location', ref => ref.child(this.userKey))
            .query.once('value').then( userSnap =>{
              userData = userSnap.val();
              userData['coordinates'] = {
                latitude: userData['currentLocation'].latitude,
                longitude: userData['currentLocation'].longitude,
              }
            }).then(() =>{
              let distance = geolib.getDistance(data['coordinates'], userData['coordinates']);
              if(distance<1000){
                if(distance>100){
                  this.distanceAway = Math.round(distance/100)*100+"m away";
                }
                else{
                  this.distanceAway = "less than 100 meters away";
                }
              }
              else{
                this.distanceAway = Math.round(distance/1000)+"km away"
              }
            });
        });
      });
  }
  getActiveStatus(){
    let dateNow = moment().valueOf();
    this.db.list('activity', ref=> ref.child(this.userKey))
      .query.once('value').then(activeSnap =>{
        let data = activeSnap.val();
        let statusDate = data['isActive'].timestamp;
        let userStatus = data['isActive'].status;
        if(dateNow-statusDate < 60000 || userStatus){
           this.activeWhen = "Active Now";
        }
        else{
          this.activeWhen = "Active "+moment(statusDate).fromNow();;
        }
      });
  }
  getMutualInterest(){
    this.db.list('profile', ref=> ref.child(this.authKey))
      .query.once('value').then(snapshot =>{
        let data = snapshot.val();
        this.sameInterests = this.userInterests.filter( item =>{
          return data['interests'].indexOf(item) > -1;
        });
      });
  }
  getQuestions(){
    this.db.list('answers', ref=> ref.child(this.userKey).orderByChild('timestamp').limitToLast(10))
      .query.once('value').then( snapshot =>{
        let dateNow = moment().valueOf();
        snapshot.forEach( element =>{
          let data = element.val();
          if((dateNow-data['timestamp'])<this.quizDuration){
            this.questions.push(data);
          }
        });
      });
  }
  close_modal(){
    this.view.dismiss();
  }
  reportUser(){
    let modal = this.modalCtrl.create(UserReportPage, {user: this.userKey});
    modal.present();
  }
}
