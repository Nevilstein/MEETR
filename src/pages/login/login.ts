import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, LoadingController, ToastController } from 'ionic-angular';

//Pages
import { UserProfilePage } from '../user/user-profile/user-profile';
import { AdminTabsPage } from '../admin/admin-tabs/admin-tabs';
import { UserTabsPage } from '../user/user-tabs/user-tabs';
import { UserFormPage } from '../user/user-form/user-form';
import { UserGeoPage } from '../user/user-geo/user-geo';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import moment from 'moment';
import firebase from 'firebase';

//Providers
import { AuthProvider } from '../../providers/auth/auth';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  count;
  loading: boolean = true;
  loginSubscription;
  constructor(public loadingCtrl: LoadingController,public navCtrl: NavController, public navParams: NavParams,  public menuCtrl:MenuController, public fb: Facebook, 
    private fireAuth: AngularFireAuth, private db: AngularFireDatabase, private zone: NgZone, private storage: AngularFireStorage,
    private authProvider: AuthProvider, public toastCtrl: ToastController) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    console.log(moment().format("YYYY/MM/DD HH:mm:ss"));
    this.loginRedirect();
  } 

  ionViewWillUnload(){
    this.loginSubscription.unsubscribe();
  }

  loginRedirect(){
    this.loginSubscription = this.fireAuth.authState.subscribe( fireRes =>{
      if(fireRes){
        this.fb.getLoginStatus().then(fbRes =>{
          if(fbRes.status === 'connected'){
            this.getFacebookData(fbRes.authResponse.userID, fbRes.authResponse.accessToken).then( fbData => {
              if( fbData['age']<18){  //if user underaged
                let toast = this.toastCtrl.create({
                  message: "User must be at least 18 years old.",
                  duration: 1000,
                  position: 'bottom'
                });
                toast.present().then( () =>{
                  fireRes.delete();  //delete account
                  this.fb.logout();
                  this.loading = false;
                });
              }
              else{
                this.loginToApp(fbData, fireRes);
              }
            }).catch( e =>{
              let toast = this.toastCtrl.create({
                message: "Login Error",
                duration: 1000,
                position: 'bottom'
              });
              toast.present();
            });
          }
          else{
            this.loading = false;
          }
        }); 
      }
      else{
        this.loading = false;
      }
    });
  }

  loginToApp(fbData, fireRes){
    this.db.database.ref('profile').child(fireRes.uid).once('value', snapshot =>{
      let maxAge = 50, minAge = 18;
      var ageLower = minAge, ageUpper = fbData['age']+5;
      if(!snapshot.exists()){    //Snapshot exists checks if this is user's first login by checking their id in "profile" collection
        
        if(fbData['age'] >= maxAge-5){  //for Age greater than
          ageUpper = 50;
        }
        var profile = {
          firstName: fbData['first_name'],
          lastName: fbData['last_name'],
            // locations: '',  //for adding location feature?
          birthday: fbData['birthday'],
          maxDistance: 80,
          ageRange: {min: ageLower, max: ageUpper},
          isVisible: true,
          bio: '',
          photos: [fbData['picture'].data.url],
          dateCreated: firebase.database.ServerValue.TIMESTAMP,
          lastLogin: firebase.database.ServerValue.TIMESTAMP,
          status: 'active',
          friendCount: fbData['friend_count'],
          isLoggedIn: true,
          showMoments: false
        }
        this.zone.run(() => {    //if snapshot doesn't exist redirect to wizard form
            this.authProvider.isFirstLogin = true;
            this.navCtrl.setRoot(UserFormPage, {
              profile: profile
            });
        });
      }
      else{
        this.db.list('profile').update(this.fireAuth.auth.currentUser.uid, {
          firstName: fbData['first_name'],
          lastName: fbData['last_name'],
          friendCount: fbData['friend_count'],
          lastLogin: firebase.database.ServerValue.TIMESTAMP,
          isLoggedIn: true
        }).then( () =>{
          this.zone.run(() => {
            // this.navCtrl.push(LoadingPage);
            this.authProvider.isFirstLogin = false;
            this.navCtrl.setRoot(UserTabsPage)
          });
        });
      }
    });
  }

  facebookLogin(){
    this.fb.login(['public_profile', 'user_photos', 'email', 'user_birthday', 'user_friends'])
      .then( (res: FacebookLoginResponse) => {
        if(res.status === "connected"){
            this.firebaseLogin(res);  
        }
        else{
          console.log("Facebook not connected.");
        }
      });
  }
  
  firebaseLogin(fbLoginData){
    const fbCredential = firebase.auth.FacebookAuthProvider.credential(fbLoginData.authResponse.accessToken);
    this.fireAuth.auth.signInAndRetrieveDataWithCredential(fbCredential).catch(error =>{
      let toast = this.toastCtrl.create({
          message: "Login Unsuccessful",
          duration: 1000,
          position: 'bottom'
        });
        toast.present();
    });
  }

  getFacebookData(userid, fbToken) {
    var promise = new Promise((resolve, reject) => {
      this.fb.api("/"+userid+"/?fields=id,email,first_name,last_name,picture.width(960).height(960),birthday,age_range,friends",["public_profile"])
        .then(res => {
          // 'https://graph.facebook.com/'+userid+'?fields=id&access_token='+fbToken;var message = '5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
          res['friend_count'] = res.friends.summary.total_count;
          res['age'] = moment().diff(moment(res.birthday, "MM/DD/YYYY"), 'years');
          console.log(res);
          resolve(res);
        })
        .catch(error => {
          reject(error);
        });
    });
    return promise;
  }
  gotoGeo(){
    this.navCtrl.push(UserGeoPage);
  }
  gotoUser(){
    this.navCtrl.push(UserTabsPage);
  }
  presentLoadingDefault() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 5000);
  }
}

