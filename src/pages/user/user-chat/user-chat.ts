  import { Component, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

//Pages
import { UserChatroomPage } from '../user-chatroom/user-chatroom';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
// import { ChatProvider } from '../../../providers/chat/chat';

/**
 * Generated class for the UserChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-chat',
  templateUrl: 'user-chat.html',
})
export class UserChatPage {
  //Variables
  authKey = this.authProvider.authUser;
  chatList = [];
  chatCount = 50;
  chatTabLoading = true;

  //Observer/Subscriptions
  chatObserver;
  chatNewObserver;
  userProfileObserver;
  constructor(public navCtrl: NavController, public navParams: NavParams, private db:AngularFireDatabase, 
    private authProvider: AuthProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserChatPage');
    this.getChats();
  }

  getChats(){  
      this.chatObserver = this.db.list('chat', ref => ref.child(this.authKey).orderByChild('timestamp'))
        .snapshotChanges().subscribe( snapshot => {
          var chatPromise = new Promise(resolve =>{
            let reversedSnap = snapshot.slice().reverse();
            let chatArray = [];
            reversedSnap.forEach( (element, index) =>{
              let data = element.payload.val();
              data['id'] = element.key;

              this.db.list('profile', ref=> ref.child(data['receiver'])).query.once('value', profileSnap => {
                  let profileData = profileSnap.val();
                  data['firstName'] = profileData.firstName;
                  data['lastName'] = profileData.lastName;
                  data['userImage'] = profileData.photos[0];
                  data['userKey'] = profileSnap.key;
              });
              this.db.list('messages', ref=> ref.child(this.authKey).child(data['id']).orderByChild('timestamp').limitToLast(1))
                .query.once('value', messageSnap =>{
                  messageSnap.forEach( element =>{  //only returns one, foreach to include checking if got 1
                    let messageData = element.val();
                    Object.assign(data, messageData);
                    let message = ((data['sender'] === this.authKey)? "You: " : (data['firstName']+": "))+data['message'];
                    data['message'] = (message.length>25 ? message.substring(0, 25)+"..." : message);
                    data['messageDate'] = this.messageDateFormat(data['timestamp']);
                  });
                if(data['matchStatus']){  //only chats with active matches
                  chatArray.push(data);
                }
                if(index+1 === reversedSnap.length){
                  resolve(chatArray);
                } 
              });
            });
          }).then( chatList => {
            this.chatList = [];
            this.chatList = Object.assign(chatList);
          });
        });
  }
  messageDateFormat(date){
    let dateNow = moment().valueOf();
    let dayUnix = 86400000;
    let weekUnix = 604800000;
    if((dateNow-date) < dayUnix){
      return moment(date).format("LT");
    }
    else if((dateNow-date) > dayUnix && (dateNow-date) < weekUnix){
      return moment(date).format("ddd LT");
    }
    else if((dateNow-date) > weekUnix){
      return moment(date).format("MMM D");
    }

  }
  openChat(chatKey, userKey){
    this.navCtrl.push(UserChatroomPage, {
      chatKey: chatKey, 
      userKey: userKey
    });
  }  

  searchInput(event){

  }
}
