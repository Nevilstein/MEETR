import { Component, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

//Pages
import { UserChatroomPage } from '../user-chatroom/user-chatroom';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { ChatProvider } from '../../../providers/chat/chat';

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
  chatSearchValue:string = '';
  chatList = [];
  filterChat = [];
  chatCount = 50;
  chatTabLoading = true;
  loader;

  //Observer/Subscriptions
  chatObserver;
  chatNewObserver;
  userProfileObserver;
  constructor(public navCtrl: NavController, public navParams: NavParams, private db:AngularFireDatabase, 
    private authProvider: AuthProvider, private chatProvider: ChatProvider, private loadingCtrl: LoadingController) {
  }

  ionViewWillLoad() {
    console.log('ionViewDidLoad UserChatPage');
    this.loader = this.loadingCtrl.create({
      content: 'Please wait..'
    });
    this.loader.present();
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
                if(messageSnap){
                  messageSnap.forEach( element =>{  //only returns one, foreach to include checking if got 1
                    let messageData = element.val();
                    var message;
                    if(messageData.type === 'message'){
                      message = ((messageData['sender'] === this.authKey)? "You: " : (data['firstName']+": "))+messageData['message'];
                      data['message'] = (message.length>25 ? message.substring(0, 25)+"..." : message);
                    }
                    else if(messageData.type === 'image'){
                      message = ((messageData['sender'] === this.authKey)? "You" : (data['firstName']));
                      data['message'] = message+" "+"sent a photo.";
                    }
                    data['messageDate'] = this.messageDateFormat(messageData['timestamp']);
                    data['messageStatus'] = messageData['status'];
                    console.log(data['messageStatus']);
                    data['isRead'] = messageData['isRead'];
                  });
                if(data['matchStatus']){  //only chats with active matches
                  chatArray.push(data);
                }
                if(index+1 === reversedSnap.length){
                  resolve(chatArray);
                } 
              }
              else{
                if(index+1 === reversedSnap.length){
                  resolve(chatArray);
                } 
              }  
            });
              
          });
        }).then( chatList => {
          this.chatList = [];
          this.chatList = Object.assign(chatList);
          if(!(this.filterChat.length>0)){
            this.filterChat = this.chatList;
          }
          this.searchMatch();  //update changes even while in searching process
          this.loader.dismiss();
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
    // this.navCtrl.push(UserChatroomPage, {
    //   chatKey: chatKey, 
    //   userKey: userKey
    // });
    this.navCtrl.push(UserChatroomPage);
    this.chatProvider.chatKey = chatKey;
    this.chatProvider.receiverKey = userKey;
  }  

  searchMatch(){
    this.filterChat = this.chatList.filter( chat =>{
      if(chat.firstName.toLowerCase().indexOf(this.chatSearchValue.toLowerCase()) > -1){
        return true;
      }
      return false;
    });
  }
}
