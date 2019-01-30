import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Tabs, App } from 'ionic-angular';

//Pages
import { UserChatroomPage } from '../user-chatroom/user-chatroom';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the UserMatchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-match',
  templateUrl: 'user-match.html',
})
export class UserMatchPage {

  authUser = this.authProvider.authUser;

  userLikedKey = this.navParams.get('userMatchKey');
  userImage: string;
  userLikedImage: string;
  userLikedName: string;
  chatKey:string = null;
  constructor(public navCtrl: NavController, public navParams: NavParams ,private view: ViewController, 
    private db: AngularFireDatabase, private fireAuth: AngularFireAuth, private authProvider: AuthProvider,
    private appCtrl: App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserMatchPage');
    this.getChatRoom();
    this.getUserData();
    this.getLikedData();
  }

  //add a promise and ready variable to make sure that userData and userLikedData is retrieved before loading modal
  getChatRoom(){
    this.db.list('chat', ref => ref.child(this.authUser).orderByChild('receiver').equalTo(this.userLikedKey))
      .query.on('value', snapshot =>{
        snapshot.forEach( element => {
          let data = element.val();
          if(data.matchStatus === true){
            this.chatKey = element.key;
          }
        });
      });
  }

  getUserData(){
    this.db.list('profile', ref => ref.child(this.authUser))
      .query.once('value').then(snapshot => {
        this.userImage = snapshot.val().photos[0];
      });
  }

  getLikedData(){
    this.db.list('profile', ref => ref.child(this.userLikedKey))
      .query.once('value').then( snapshot => {
        let data = snapshot.val();
        this.userLikedImage = data.photos[0];
        this.userLikedName = data.firstName;  //change to first name next, also change name to first name and last name in login
      });
  }

  chatStart(){
    if(this.chatKey){  //hack if data processes slow to avoid error
      this.view.dismiss();  
      this.navCtrl.push(UserChatroomPage, {
        chatKey: this.chatKey, 
        userKey:this.userLikedKey
      }).then(() =>{
        this.appCtrl.getRootNav().getActiveChildNav().select(2)
      })
    }
  }

  keep_swiping(){
    this.view.dismiss();
  }

}
