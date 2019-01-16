import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';

//Pages
import { UserProfilePage } from '../user/user-profile/user-profile';
import { AdminTabsPage } from '../admin/admin-tabs/admin-tabs';
import {UserTabsPage} from '../user/user-tabs/user-tabs';
import {UserGeoPage} from '../user/user-geo/user-geo';

//Plugins
import { Observable } from 'rxjs';
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
  loading = true;
  constructor(public navCtrl: NavController, public navParams: NavParams,  public menuCtrl:MenuController, public fb: Facebook, 
    private fireAuth: AngularFireAuth, private db: AngularFireDatabase) {
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    console.log(moment().format("YYYY/MM/DD HH:mm:ss"));
    this.fb.getLoginStatus().then( res =>{
      alert(res.status);
      if(res.status === 'connected'){
        this.fireAuth.authState.subscribe( authRes =>{
          if(authRes){
            this.navCtrl.setRoot(UserTabsPage).then( () =>{
              this.loading = false;
            });
          }
        });
      // else if(res.status ===  'authorization_expired'){
        //auth expired need to login again
      // }
      }
      else{
        this.loading = false;
      }
    }).catch(e =>{
      console.log("Error: ", e)
    });

    // this.fireAuth.authState.subscribe( authRes =>{
    //   console.log(authRes.uid);
    //   if(authRes){
    //     this.fb.getLoginStatus().then( res =>{
    //       alert(res.status);
    //       if(res.status === 'connected'){
    //           this.navCtrl.setRoot(UserTabsPage).then( () =>{
    //             this.loading = false;
    //           });  
    //       // else if(res.status ===  'authorization_expired'){
    //         //auth expired need to login again
    //       // }
    //       }
    //       else{
    //         this.loading = false;
    //       }
    //     }).catch(e =>{
    //       console.log("Error: ", e)
    //     });
    //   }
    // }, error =>{
    //   console.log('Auth', error);
    // });
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

  //TRY LEARNING ABOUT CHAINING PROMISES
  facebookLogin(){
    this.fb.login(['public_profile', 'user_photos', 'email', 'user_birthday'])
      .then( (res: FacebookLoginResponse) => {
        if(res.status === "connected"){
          const fbCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
          firebase.auth().signInAndRetrieveDataWithCredential(fbCredential)
            .then( fs =>{
              console.log(fs.user.uid);
              this.getFacebookData(res.authResponse.userID).then( fbData => {
                 this.db.database.ref('profile').child(fs.user.uid).once('value', snapshot =>{
                  var maxAge = 50;
                  var ageLower = fbData['age'], ageUpper = fbData['age']+5;
                  if(!snapshot.exists()){    //Snapshot exists checks if this is user's first login by checking their id in "profile" collection
                    
                    //Go to input wizard page
                    
                    if(fbData['age'] >= maxAge-5){  //for Age greater than
                      ageLower = 45;
                      ageUpper = 50;
                    }

                    this.db.list('profile').set(fs.user.uid, {
                      name: fs.user.displayName,
                      locations: '',
                      maxDistance: 80,
                      ageRange: {min: ageLower, max: ageUpper},
                      isVisible: true,
                      bio: '',
                      school: '',
                      work: '',
                      jobTitle: '',
                      photos: [fbData['picture'].data.url],
                      dateCreated: firebase.database.ServerValue.TIMESTAMP,
                      showGender: {male: false, female: true}, //should be based on gender chosen in wizard page
                      // lastLogin: moment(firebase.database.ServerValue.TIMESTAMP).format("YYYY/MM/DD HH:mm:ss"),
                      lastLogin: firebase.database.ServerValue.TIMESTAMP,
                      status: 'active',
                      isLoggedIn: true
                    });
                  }
                  else{
                    this.db.list('profile').update(fs.user.uid, {
                      lastLogin: firebase.database.ServerValue.TIMESTAMP,
                      isLoggedIn: true
                    });
                  }
                  alert("Logged in successfully.");
                  this.navCtrl.setRoot(UserTabsPage);
                });
              }).catch( e =>{
                console.log("Login Error", e);
              });
            }).catch( (e) =>{
              alert("Login Error");
              console.log("Login Error", e);
            });  
        }
        else{
          console.log("An error occurred...");
        }
      }).catch( (e) => {
        console.log("Error logging in to facebook", e);
      });

  }

  getFacebookData(userid) {
    var promise = new Promise((resolve, reject) => {
      this.fb.api("/"+userid+"/?fields=id,email,picture,birthday,age_range",["public_profile"])
        .then(res => {
          res['age'] = moment().diff(moment(res.birthday, "MM/DD/YYYY"), 'years');
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
  // LoginCheck(){
  //   var
  // }
  gotoAdmin(){
    this.navCtrl.push(AdminTabsPage);
  }
  gotoUser(){
    this.navCtrl.push(UserTabsPage);
  }
}

