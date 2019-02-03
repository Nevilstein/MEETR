import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Tabs, ModalController, ToastController } from 'ionic-angular';
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
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Diagnostic } from '@ionic-native/diagnostic';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import moment from 'moment';
// import geolib from 'geolib';


//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { MatchProvider } from '../../../providers/match/match';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public authProvider: AuthProvider, private appCtrl: App,
    private fireAuth: AngularFireAuth, private fb: Facebook, private zone: NgZone, private geolocation: Geolocation, 
    private db: AngularFireDatabase, private modalCtrl: ModalController, private platform: Platform,
    private toastCtrl: ToastController, private localNotif: LocalNotifications, private matchProvider: MatchProvider,
    private diagnostic:Diagnostic, private locationAcc: LocationAccuracy) {
      
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

  ionViewDidLoad(){
    console.log('ionViewDidLoad UserTabsPage');
    this.checkLocationSetting();
    this.listenToPlatform();
    this.listenToMatches();
    // this.trackLocation();
    this.updateActive();
    this.tabChanges();
  }

  ionViewWillUnload(){
    this.trackGeo.unsubscribe();
    this.onMatchObserver.unsubscribe();
    this.pauseObserver.unsubscribe();
    this.resumeObserver.unsubscribe();
  }

  updateActive(){
    this.db.list('activity').update(this.authUser, {  //start with active
      isActive:{
        status: true,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      }
    });
  }

  tabChanges(){
    this.tabRef.ionChange.subscribe(res =>{
      console.log("tab index =",res.index);
      this.authProvider.currentTab = res.index;
    });
  }

  checkLocationSetting(){
    this.diagnostic.isLocationEnabled().then( isAvailable =>{
      if(isAvailable){
        this.trackLocation();
      }else{
        this.locationAcc.request(this.locationAcc.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            this.trackLocation();
          },
          error => {
            if(error.code === 4){
              this.checkLocationSetting();
            }
          });
      }
    }).catch( error =>{
      console.log(error);
    })
  }

  trackLocation(){  
    this.trackGeo = this.geolocation.watchPosition()
      .subscribe( data => {
        this.db.list('location').update(this.authUser, {
          currentLocation: {
            latitude: data.coords.latitude,
            longitude: data.coords.longitude,
            timestamp: data.timestamp
          }
        });
      })
  }

  // tabChanged(event){
  //   let listener = (event.index === 1 ? true:false);
  //   console.log("hey");
  //   this.listenMatch(listener);
  // }
  listenToMatches(){
    this.onMatchObserver = this.db.list('match', ref => ref.child(this.authUser).orderByChild('timestamp').limitToLast(1))
      .snapshotChanges().subscribe( snapshot => {
        if(snapshot.length>0){  //starters don't have matches, it might give error
          let data = snapshot[0].payload.val();
          data['id'] = snapshot[0].key;

          if(!data['isSeen']){
            this.db.list('match', ref => ref.child(this.authUser)).update(data['id'], {  //seen latest match
              isSeen: true
            });
            this.seenAllMatches();
            if(!this.isPaused){
              if(this.authProvider.currentTab === 1){
                this.matchProvider.userKey = data['id'];
                const match = this.modalCtrl.create(UserMatchPage);
                match.present();
              }
              else{
                //ADD BADGE AND MESSAGE BUBBLE AT RIGHT
                let toast = this.toastCtrl.create({
                  message: "You have a match",
                  duration: 3000,
                  position: 'top'
                });
                toast.present();
              }
            }
            else if(this.isPaused){
              this.localNotif.schedule({
                id:1,
                title: "A Match!",
                text: "You have a match!"
              });
            }
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
    });

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
  seenAllMatches(){
    this.db.list('match', ref => ref.child(this.authUser).orderByChild('isSeen').equalTo(false))
      .query.once('value').then(snapshot=>{
        snapshot.forEach(element =>{
          this.db.list('match', ref => ref.child(this.authUser)).update(element.key, {
            isSeen: true
          });
        });
      });
  }
}
