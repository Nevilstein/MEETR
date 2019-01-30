import { Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, Content} from 'ionic-angular';
import { UserGeoPage } from '../user-geo/user-geo';
import { PopoverComponent } from '../../../components/popover/popover';



//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';
import firebase from 'firebase';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the UserChatroomPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-chatroom',
  templateUrl: 'user-chatroom.html',
})
export class UserChatroomPage {
  //Variables
  authKey: string = this.authProvider.authUser;
  chatKey: string = this.navParams.get('chatKey');
  receiverKey: string = this.navParams.get('userKey');
  chatLoading: boolean = true;
  messages = [];
  myMessage:string;
  messageEmpty: boolean;



  userPhoto: string;
  userFirstName: string;
  userLastName: string;
  userStatus: boolean;
  activeWhen: string;
  statusDate: number;
  isActive: boolean;

  //Observer/Subscription
  chatObserver;
  messageObserver;
  activeObserver;
  profileObserver;
  timeInterval;  //gets the active time interval of user while in chat

  //Promises
  profilePromise: Promise<boolean>;
  activePromise: Promise<boolean>;

  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController,public popoverCtrl:PopoverController , public navParams: NavParams, private db: AngularFireDatabase, 
    private authProvider: AuthProvider) {
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad UserChatroomPage');
    setTimeout(() => {
        this.content.scrollToBottom();
     }, 1000);
    this.timeInterval = setInterval(() =>{
      this.activeWhen = this.getActiveStatus();  
    }, 60000)
    this.getChatData();
    this.getUserData();
  }
  ionViewWillUnload(){
    this.activeObserver.unsubscribe();
    // this.chatObserver.unsubscribe();
    this.messageObserver.unsubscribe();
    this.profileObserver.unsubscribe();
    clearInterval(this.timeInterval);
  }
  /*
  PROBLEMS:
    Show more messages
    Chatloading
    Active time
    Add match in chatlist?
  */
  getChatData(){
    // this.chatObserver = this.db.list('chat', ref=> ref.child(this.authKey).child(this.chatKey))
    //   .snapshotChanges().subscribe( snapshot => {
    //     // this.db.list('chat', ref=> ref.child(this.authKey).child(this.chatKey)
    //     //   .child('messages').orderByChild('isRead').equalTo(true)).query.once('value', messageSnap =>{
    //     //     console.log(messageSnap.val());
    //     //   }).then( () =>{
    //         let data = snapshot[0].payload.val();
    //         this.messages = data['messages'];

    //       // });
    //   });
    this.chatObserver = this.db.list('chat', ref=> ref.child(this.authKey))
    this.messageObserver = this.db.list('messages', ref=> ref.child(this.authKey).child(this.chatKey)
      .orderByChild('timestamp')).snapshotChanges().subscribe(snapshot => {
        let messageArr = []
        var messagePromise = new Promise(resolve =>{
          snapshot.forEach( element => {
            let data = element.payload.val();
            data['id'] = element.key;
            messageArr.push(data);
          });
          resolve(true);
        });
        messagePromise.then(() =>{
          this.messages = messageArr;
        });
      });
  }

  getUserData(){
    this.activeObserver = this.db.list('activity', ref=> ref.child(this.receiverKey))  //get activeness of other user
      .valueChanges().subscribe(snapshot =>{
         snapshot.forEach( element =>{
           this.userStatus = element['status'];
           this.statusDate = element['timestamp'];
           this.activeWhen = this.getActiveStatus();
         });
         this.activePromise = Promise.resolve(true);
      });
    this.profileObserver = this.db.list('profile', ref=> ref.orderByKey().equalTo(this.receiverKey))
      .snapshotChanges().subscribe( snapshot => {
         snapshot.forEach( element => {
           let data = element.payload.val();
           this.userPhoto = data['photos'][0];
           this.userFirstName = data['firstName'];
           this.userLastName = data['lastName'];
         });
         this.profilePromise = Promise.resolve(true);
      });
  }

  getActiveStatus(){
    let dateNow = moment().valueOf();
    if(dateNow-this.statusDate < 60000 || this.userStatus){
      this.isActive = true;
      return "Now";
    }
    else{
      this.isActive = false;
      return moment(this.statusDate).fromNow();
    }
  }

  sendMessage(){
    let sentDate = moment().valueOf();
    var sentMessage = this.myMessage;
    this.myMessage = null;
    this.db.list('messages', ref=> ref.child(this.authKey).child(this.chatKey)).push({
      message: sentMessage,
      sender: this.authKey,
      timestamp: sentDate,
      // type: 'message'/'photo',
      isRead: true,
      status: true
    }).then( messageValue =>{
      this.db.list('messages', ref => ref.child(this.receiverKey).child(this.chatKey))
        .set(messageValue.key,{
          message: sentMessage,
          sender: this.authKey,
          timestamp: sentDate,
          // type: 'message'/'photo',
          isRead: false,
          status: true
        });
    });
    this.db.list('chat', ref=> ref.child(this.authKey)).update(this.chatKey, {
      timestamp:sentDate
    });
    this.db.list('chat', ref=> ref.child(this.receiverKey)).update(this.chatKey, {
      timestamp:sentDate
    });
  }

  checkMessage(){
    this.messageEmpty = this.myMessage.trim() == ''? true:false;
  }

  gotoGeo(){
    this.navCtrl.push(UserGeoPage);
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopoverComponent);
    popover.present({
      ev: myEvent
    });
  }
}
