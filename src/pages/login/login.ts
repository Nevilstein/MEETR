import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';

//Pages
import { UserProfilePage } from '../user/user-profile/user-profile';
import { AdminTabsPage } from '../admin/admin-tabs/admin-tabs';
import { UserTabsPage } from '../user/user-tabs/user-tabs';
import { UserFormPage } from '../user/user-form/user-form';
import { UserGeoPage } from '../user/user-geo/user-geo';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import moment from 'moment';
import firebase from 'firebase';



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
  constructor(public navCtrl: NavController, public navParams: NavParams,  public menuCtrl:MenuController, public fb: Facebook, 
    private fireAuth: AngularFireAuth, private db: AngularFireDatabase, private zone: NgZone) {
    
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    console.log(moment().format("YYYY/MM/DD HH:mm:ss"));
    // this.fb.logout();
    this.loginRedirect();
  }  

  // facebookLogin(){    //LOGS IN ORDER OF 2,3,1
  //   this.fb.login(['public_profile', 'user_photos', 'email', 'user_birthday'])
  //     .then( (res: FacebookLoginResponse) => { 
  //       this.fbLoginResponse = res;
  //       const fbCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken)
  //       this.fireAuth.auth.signInAndRetrieveDataWithCredential(fbCredential).then( fs => {
  //         console.log("1", this.fbLoginResponse);
  //       });
  //       console.log('2', this.fbLoginResponse);
  //   }).then(() => {
  //     console.log("3", this.fbLoginResponse)
  //   })
  // }

  loginRedirect(){
    this.fireAuth.authState.subscribe( fireRes =>{
      this.fb.getLoginStatus().then(fbRes =>{
        if(fireRes!=null && fbRes.status === 'connected'){
          // console.log(fireRes.uid);
          // alert("Logged in successfully.");
          console.log(fbRes);
          this.getFacebookData(fbRes.authResponse.userID, fbRes.authResponse.accessToken).then( fbData => {
            this.db.database.ref('profile').child(fireRes.uid).once('value', snapshot =>{
              var maxAge = 50;
              var ageLower = fbData['age'], ageUpper = fbData['age']+5;
              if(!snapshot.exists()){    //Snapshot exists checks if this is user's first login by checking their id in "profile" collection
                
                if(fbData['age'] >= maxAge-5){  //for Age greater than
                  ageLower = 45;
                  ageUpper = 50;
                }


                var profile = {
                  name: fireRes.displayName,
                    // locations: '',  //for adding location feature?
                  maxDistance: 80,
                  ageRange: {min: ageLower, max: ageUpper},
                  isVisible: true,
                  bio: '',
                  school: '',
                  work: '',
                  jobTitle: '',
                  photos: [fbData['picture'].data.url],
                  dateCreated: firebase.database.ServerValue.TIMESTAMP,
                  lastLogin: firebase.database.ServerValue.TIMESTAMP,
                  status: 'active',
                  // friendCount: fbData['friend_count'],
                  isLoggedIn: true
                }
                this.zone.run(() => {    //if snapshot doesn't exist redirect to wizard form
                    this.navCtrl.setRoot(UserFormPage, {profile});
                });
              }
              else{
                this.db.list('profile').update(this.fireAuth.auth.currentUser.uid, {
                  lastLogin: firebase.database.ServerValue.TIMESTAMP,
                  isLoggedIn: true
                }).then( () =>{
                  this.zone.run(() => {
                    this.loading = false
                    this.navCtrl.setRoot(UserTabsPage);
                  });
                });
              }
            });
          }).catch( e =>{
            console.log("Login Error", e);
          });
        }
        else{
          this.loading = false;
        }
      });
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
      }).catch( error => {
        console.log("Error logging in to facebook.", error);
      });

  }
  
  firebaseLogin(fbLoginData){
    const fbCredential = firebase.auth.FacebookAuthProvider.credential(fbLoginData.authResponse.accessToken);
    this.fireAuth.auth.signInAndRetrieveDataWithCredential(fbCredential).catch(error =>{
      console.log("Error logging in with Firebase.", error);
    });
  }

  getFacebookData(userid, fbToken) {
    var promise = new Promise((resolve, reject) => {
      this.fb.api("/"+userid+"/?fields=id,email,picture.type(large),birthday,age_range,friends",["public_profile"])
        .then(res => {
          // 'https://graph.facebook.com/'+userid+'?fields=id&access_token='+fbToken;
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
  gotoAdmin(){
    this.navCtrl.push(AdminTabsPage);
  }
  gotoUser(){
    this.navCtrl.push(UserTabsPage);
  }
}

