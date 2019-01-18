import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

//Page
import { UserProfilePage } from '../user-profile/user-profile';

//Plugin
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

//Providers
import { UserProvider } from '../../../providers/user/user';
/**
 * Generated class for the UserEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-edit',
  templateUrl: 'user-edit.html',
})
export class UserEditPage {
  //Display variables
  interests = [];
  bio: string = "";
  isMale: boolean;
  isFemale: boolean;
  //Element variables
  interestInputValue: string = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, private fireAuth: AngularFireAuth, 
    private db: AngularFireDatabase, private userProvider: UserProvider) {
  }

  ionViewDidLoad() {
    this.loadProfile();
    console.log('ionViewDidLoad UserEditPage');
  }
  goBack(){
  	this.navCtrl.push(UserProfilePage);
  }

  loadProfile(){
    this.userProvider.getUserProfile().snapshotChanges().subscribe( snapshot => {  //Angularfire2
      var data = snapshot[0].payload.toJSON();
      this.bio = data['bio'];
      this.interests = Object.assign([], data['interests']);
      this.isMale = data['gender'].male;
      this.isFemale = data['gender'].female;
    });
  }
  addInterest(interest){
    // console.log(this.interestInput._value);
    // this.interestInput.clearTextInput();
    this.interests.push(interest);
    this.interestInputValue = null;
    this.dbUpdateProfile();
  }
  deleteInterest(interestNumber){
    if(this.interests.length > 1){
      this.interests.splice(interestNumber, 1);
      this.dbUpdateProfile();
    }
  }
  dbUpdateProfile(){
    this.db.list('profile').update(this.fireAuth.auth.currentUser.uid, {
      interests: this.interests,
      bio: this.bio,
      gender: {
         male: this.isMale,
         female: this.isFemale
      }
    });
  }
  bioChanged(){
    this.dbUpdateProfile();
  }
  chooseMale(){
    this.isFemale = !this.isMale;
    this.dbUpdateProfile();
  }
  chooseFemale(){
    this.isMale = !this.isFemale;
    this.dbUpdateProfile();
  }
}
