import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Tabs, ModalController } from 'ionic-angular';
// import { SuperTabsController } from 'ionic2-super-tabs';
import { Platform } from 'ionic-angular';

//Pages
import { LoginPage } from '../../login/login';
import { UserProfilePage } from '../user-profile/user-profile';
import { UserHomePage } from '../user-home/user-home';
import { UserChatPage } from '../user-chat/user-chat';
import { UserMatchPage } from '../user-match/user-match';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Facebook } from '@ionic-native/facebook';
import { Geolocation } from '@ionic-native/geolocation';
import firebase from 'firebase';
// import geolib from 'geolib';


//Providers
import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the UserTabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-tabs',
  templateUrl: 'user-tabs.html',
})
export class UserTabsPage {
  constructor(public navCtrl: NavController, public navParams: NavParams, private authProvider: AuthProvider, private appCtrl: App,
    private fireAuth: AngularFireAuth, private fb: Facebook, private zone: NgZone, private geolocation: Geolocation, 
    private db: AngularFireDatabase, private modalCtrl: ModalController, private platform: Platform) {
      
  }

  @ViewChild('userTab') tabRef: Tabs;
  user_tab1root = UserProfilePage;
  user_tab2root = UserHomePage;
  user_tab3root = UserChatPage;

  authUser = this.authProvider.authUser;  //ID of authenticated user

  //Observers/Subscriptions
  onMatchObserver:any;  //listens for sent likes
  pauseObserver: any;  //listens to app pause activity
  resumeObserver: any; //listens to app resume activity
  trackGeo:any;  //listens to location

  tabIndex: number;
  isPaused: boolean = false;
  // count=0;

  // ngOnDestroy(){
  //   this.onMatchObserver.unsubscribe();
  //   this.trackGeo.unsubcribe();
  //   this.pauseObserver.unsubscribe();
  //   this.resumeObserver.unsubscribe();
  // }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserTabsPage');
    this.trackLocation();
    this.listenToPlatform();
    this.listenToMatches();
    
    this.tabRef.ionChange.subscribe(res =>{
      console.log("tab index =",res.index);
      this.tabIndex = res.index;
    });
    
  }

  ionViewWillUnload(){
    this.trackGeo.unsubscribe();
    this.onMatchObserver.unsubscribe();
    this.pauseObserver.unsubscribe();
    this.resumeObserver.unsubscribe();
  }

  trackLocation(){  
    this.trackGeo = this.geolocation.watchPosition();
    this.trackGeo.subscribe((data) => {
      this.db.list('location').update(this.authUser, {
        currentLocation: {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude,
          timestamp: data.timestamp
        }
      });
    });
  }

  // tabChanged(event){
  //   let listener = (event.index === 1 ? true:false);
  //   console.log("hey");
  //   this.listenMatch(listener);
  // }
  listenToMatches(){
    console.log('matches');
    let currentUser = this.fireAuth.auth.currentUser.uid;
    this.onMatchObserver = this.db.list('match', ref => ref.child(currentUser).orderByChild('timestamp').limitToLast(1))
      .snapshotChanges().subscribe( snapshot => {
        if(snapshot.length>0){  //starters don't have matches, it might give error
          console.log(snapshot);
          let data = snapshot[0].payload.val();
          data['id'] = snapshot[0].key;

          if(!data['isSeen']){
            this.db.list('match', ref => ref.child(currentUser)).update(data['id'], {
              isSeen: true
            });
            if(!this.isPaused){
              const match = this.modalCtrl.create(UserMatchPage, {
                userMatchKey: data['id']
              });
              match.present();
            }
            // else{
            //   //NOTIFY THE USER THEN SEEN
            // }
          }
        }
        
      });
  }

  listenToPlatform(){
    console.log('platform');
    this.resumeObserver = this.platform.resume.subscribe(() =>{
      this.isPaused = false;
      this.db.list('activity').update(this.authUser, {
        isActive:{
          status: true,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }
      });
    })
    this.pauseObserver =this.platform.pause.subscribe(() =>{
      this.isPaused = true;
      this.db.list('activity').update(this.authUser, {
        isActive:{
          status: false,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }
      });
    });
    // this.platform.exitApp()
  }
}
