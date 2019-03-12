import { Component, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

//Pages
import { UserChatroomPage } from '../user-chatroom/user-chatroom';
import { UserChatTutorialPage } from '../user-chat-tutorial/user-chat-tutorial';

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
  allMeetups = [];

  chatData = [];  //contains all chat including its messages
  matchedUsers = [];

  //Observer/Subscriptions
  chatObserver;
  newChatObserver;
  meetupObserver;
  matchObserver;
  // usersProfileObserver = [];
  // usersActiveObserver = [];
  // usersMomentsObserver = [];
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
    // this.getMatchedUsers();
  }

  ionViewWillUnload(){
    this.chatObserver.unsubscribe();
    this.newChatObserver.unsubscribe();
    this.meetupObserver.unsubscribe();
    this.matchObserver.unsubscribe();
  }

  getChats(){  
    this.chatObserver = this.db.list('chat', ref => ref.child(this.authKey).orderByChild('timestamp'))
      .snapshotChanges().subscribe( snapshot => {
        if(snapshot.length>0){
          let chatArray = [];
          var chatPromise = new Promise(resolve =>{
            let reversedSnap = snapshot.slice().reverse();
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
                  // console.log("message", messageSnap);
                  // if(messageSnap){
                    messageSnap.forEach( newElement =>{  //only returns one, foreach to include checking if got 1
                      let messageData = newElement.val();
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
                      data['isRead'] = messageData['isRead'];
                    });
                    // if(index+1 === reversedSnap.length){
                    //   resolve(true);
                    // } 
                  // }
                  // else{    //02-02-19 if added, might have error
                  //   if(index+1 === reversedSnap.length){
                  //     resolve(true);
                  //   } 
                  // }  
                }).then(()=>{
                  if(data['matchStatus']){  //only chats with active matches
                    chatArray.push(data);
                  }
                  if(index+1 === reversedSnap.length){
                    resolve(true);
                  } 
                });
            });
          }).then(() => {
            this.chatList = [];
            this.chatList = chatArray;
            console.log(this.chatList);
            // if(!(this.filterChat.length>0)){
             
            // }
            if(this.chatSearchValue.trim()!=''){
              this.searchMatch();  //update changes even while in searching process
            }
            else{
              this.filterChat = this.chatList;
            }
            // this.loader.dismiss();
            this.getChatData();
          });
        }
        else{
          this.loader.dismiss();
        }
      });
  }
  getChatData(){
    this.newChatObserver = this.db.list('chat', ref => ref.child(this.authKey).orderByChild('timestamp'))
      .snapshotChanges().subscribe( snapshot => {
        var chatPromise = new Promise (resolve =>{
          snapshot.forEach( (element,index) => {
            let data = element.payload.val();
            data['id'] = element.key;
            data['messages'] = [];
            this.db.list('messages', ref=> ref.child(this.authKey).child(data['id']).orderByChild('timestamp'))
              .query.once('value', messageSnap =>{
                if(messageSnap){
                  messageSnap.forEach( newElement =>{  //only returns one, foreach to include checking if got 1
                    let messageData = newElement.val();
                    messageData['id'] = newElement.key;
                    data['messages'].push(messageData);
                  });
                  this.chatData.push(data);
                  if(index+1 === snapshot.length){
                    resolve(true);
                  } 
                }
                else{    //02-02-19 if added, might have error
                  if(index+1 === snapshot.length){
                    resolve(true);
                  } 
                }
              });
          });
        });
        chatPromise.then(() =>{
          // this.getMeetups();
          this.loader.dismiss();
        });
      });
  }
  // getMeetups(){
  //   this.meetupObserver = this.db.list('userMeetups', ref=> ref.orderByKey().equalTo(this.authKey))
  //     .snapshotChanges().subscribe(snapshot =>{
  //       let reversedSnap = snapshot.slice().reverse();
  //       let meetups = [];
  //       var meetupPromise = new Promise(resolve =>{
  //         reversedSnap.forEach(element => {
  //           let data = element.payload.val();
  //           data['id'] = element.key;
  //           meetups.push(data);
  //         });
  //         resolve(true);
  //       });
  //       meetupPromise.then(() =>{
  //         this.allMeetups = [];
  //         this.allMeetups = meetups;
  //         this.chatProvider.allrequests = meetups;
  //         this.loader.dismiss();
  //       });
  //     });
  // }
  // getMatchedUsers(){
  //   this.matchObserver = this.db.list('match', ref => ref.orderByKey().equalTo(this.authKey))
  //     .snapshotChanges().subscribe( snapshot => {
  //       let matches = [];
  //       this.clearMatchedData();
  //       snapshot.forEach(element => {
  //         let data = element.payload.val();
  //         data['id'] = element.key;
  //         matches.push(data);
  //       });
  //       this.matchedUsers = matches;
  //       this.matchedUsers.forEach( match =>{
          
  //       });
  //     });
  // }
  // clearMatchedData(){
  //   this.usersProfileObserver.forEach(item =>{
  //     item.unsubscribe();
  //   });
  //   this.usersProfileObserver = [];
  //   this.usersActiveObserver.forEach(item =>{
  //     item.unsubscribe();
  //   });
  //   this.usersActiveObserver = [];
  //   this.usersMomentsObserver.forEach(item => {
  //     item.unsubscribe();
  //   });
  //   this.usersMomentsObserver = [];
  // }
  // getMatchedData(matchedId){

  // }
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
    this.chatProvider.chatKey = chatKey;
    this.chatProvider.receiverKey = userKey;
    let chatIndex = this.chatData.findIndex(item => item.id === chatKey);
    this.chatProvider.messages = this.chatData[chatIndex]['messages'];
    this.navCtrl.push(UserChatroomPage);
  }  

  searchMatch(){
    this.filterChat = this.chatList.filter( chat =>{
      if(chat.firstName.toLowerCase().indexOf(this.chatSearchValue.toLowerCase()) > -1){
        return true;
      }
      else{
        return false;
      }
    });
  }
}
