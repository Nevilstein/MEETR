import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams} from 'ionic-angular';

//Pages
import { LoginPage } from '../../login/login';
import { UserEditPage } from '../user-edit/user-edit';
import { UserTabsPage } from '../user-tabs/user-tabs';
import { UserSettingPage } from '../user-setting/user-setting';

//Plugin
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import moment from 'moment';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

//Providers
import { UserProvider } from '../../../providers/user/user';

/**
 * Generated class for the UserProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  profile = [];
  name: string;
  age: string;
  image: string;
  bio: string;
  interests = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public fb:Facebook, private fireAuth: AngularFireAuth,
    private db: AngularFireDatabase, private userProvider: UserProvider) {
      // console.log(this.userProvider.loading);
      this.loadProfile();
    // this.db.list('profile', ref => ref.orderByKey().equalTo("dHOyWdIpR6QDbux69irHeeqPxsv1")).snapshotChanges().subscribe( snapshot => {
    //     var something = [];
    //     snapshot.forEach( element => {
    //       let item = element.payload.toJSON();
    //       item['id']= element.key
    //       something.push(item);
    //       this.result1 = something[0];
    //     });
    //   });
    
    // fb.getLoginStatus().then(res => {
    //   if(res.status === 'connected'){
    //     this.fb.api("/"+res.authResponse.userID+"/?fields=id,email,name,first_name,picture,birthday,age_range",["public_profile"])
    //     .then(res => {
    //       res.age = moment().diff(moment(res.birthday, "MM/DD/YYYY"), 'years');
    //       console.log(res);
    //     })
    //     .catch(e => {
    //       console.log(e);
    //     });
    //   }
    //   else{
    //     this.navCtrl.setRoot(LoginPage);
    //   }
    // })
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad UserProfilePage');
    // var id = ;
    // console.log(id);
    // this.fireAuth.authState.subscribe( authRes =>{
    //   this.db.database.ref('profile/'+authRes.uid).on('value', snapshot =>{
    //     console.log(snapshot.val());
    //   });
    //   this.db.list('profile/'+authRes.uid).valueChanges().subscribe( item => {
    //     console.log(item);
    //   })
      
    // });

        // console.log(this.fireAuth.auth.currentUser);
  }

  loadProfile(){
    // this.userProvider.getProfile().then( profileRes => {
    //   this.profile.push(profileRes);
    //   // console.log(authRes);
    // }).catch(err =>{
    //   console.log('User Profile', err)
    // })

    // this.db.database.ref('profile').child(this.fireAuth.auth.currentUser.uid).on('value', snapshot =>{
    //   var data = snapshot.val();
    //   data.id = snapshot.key;
    //   this.profile.push(data);
    // }, error => {
    //   console.log(error);;
    // });

    this.userProvider.getUserProfile().snapshotChanges().subscribe( snapshot => {  //Angularfire2
      var data = snapshot[0].payload.toJSON();
      // data['id'] = snapshot[0].key;
      this.userProvider.getFbProfile().then(fbRes => {
        data = Object.assign({}, data, fbRes);
        this.name = data['first_name'];
        this.age = data['age'];
        this.image = data['photos'][0];
        this.bio = data['bio'];
        // this.interests = '';
        // this.profile.push(data); 
        console.log(data);
      }).then( () =>{
        this.userProvider.loading = false;
      });
    })

    // this.userProvider.getUserProfile().on('value', snapshot => {  //Classic Firebase
    //   console.log(snapshot);
    //   var data = snapshot.val();
    //   data.id = snapshot.key;
    //   this.profile.push(data);
    //   console.log(this.profile);
    // })

  }

  goBack(){
    this.navCtrl.push(LoginPage);
  }
  user_edit(){
    this.navCtrl.push(UserEditPage);
  }
  user_setting(){
    this.navCtrl.push(UserSettingPage);
  }

}
