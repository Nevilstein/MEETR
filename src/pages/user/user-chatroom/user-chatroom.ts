import { Component, ViewChild, ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, 
  Content, ToastController, List, ModalController } from 'ionic-angular';

//Pages
import { UserGeoPage } from '../user-geo/user-geo';
import { ImageViewPage } from '../../image-view/image-view';
import { PopoverComponent } from '../../../components/popover/popover';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';
import firebase from 'firebase';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Camera, CameraOptions } from '@ionic-native/camera';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { ChatProvider } from '../../../providers/chat/chat';
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
  chatKey: string = this.chatProvider.chatKey;
  receiverKey: string = this.chatProvider.receiverKey;
  chatLoading: boolean = true;
  myMessage:string = '';
  messages = [];
  questions = [];
  imageMessage = [];
  loadingImage = [];
  messageEmpty: boolean = true;
  geoStatus = { sender: false, receiver: false}
  matchDate;
  unseenCount:number;
  uploadTask:AngularFireUploadTask;


  userPhoto: string;
  userFirstName: string;
  userStatus: boolean;
  activeWhen: string;
  statusDate: number;
  isActive: boolean;
  userProfile;

  //Observer/Subscription
  chatObserver;
  chatObserver2;
  messageObserver;
  activeObserver;
  profileObserver;
  questionObserver;
  uploadObserver;
  timeInterval;  //gets the active time interval of user while in chat

  //Promises
  profilePromise: Promise<boolean>;
  activePromise: Promise<boolean>;


  @ViewChild(Content) content: Content;
  @ViewChild(List, {read: ElementRef}) chatList: ElementRef;
  private mutationObserver: MutationObserver;

  constructor(public navCtrl: NavController,public popoverCtrl:PopoverController , public navParams: NavParams, 
    private db: AngularFireDatabase, private authProvider: AuthProvider, private chatProvider: ChatProvider, 
    private camera: Camera, private storage: AngularFireStorage, private toastCtrl: ToastController,
    private modalCtrl: ModalController) {
  }
  ionViewWillLoad(){
    this.timeInterval = setInterval(() =>{
      this.activeWhen = this.getActiveStatus();  
    }, 60000)
    this.getUserData();
    this.getChatData();

    this.mutationObserver = new MutationObserver((mutations) => {
        this.content.scrollToBottom(0);
    });

    this.mutationObserver.observe(this.chatList.nativeElement, {
        childList: true
    });
  }
  // ionViewDidLoad() {
  //   console.log('ionViewDidLoad UserChatroomPage');
  //   this.content.scrollToBottom(0)
  // }
  
  ionViewWillUnload(){
    this.activeObserver.unsubscribe();
    this.chatObserver.unsubscribe();
    this.chatObserver2.unsubscribe();
    this.messageObserver.unsubscribe();
    this.profileObserver.unsubscribe();
    clearInterval(this.timeInterval);
    this.navCtrl.popToRoot();
  }
  /*
  PROBLEMS:
    Show more messages
    Chatloading
    Add match in chatlist?
  */
  getChatData(){
    console.log(this.chatKey);
    this.chatObserver = this.db.list('chat', ref=> ref.child(this.authKey).orderByKey().equalTo(this.chatKey))  //my chat
      .snapshotChanges().subscribe( snapshot =>{
        snapshot.forEach( element =>{
          let data = element.payload.val();
          data['id'] = element.key;
          console.log(data);
          if(!data['matchStatus']){  //check if match is still active
            this.navCtrl.pop();
          }

          if(data['unseenCount']>0){  //messages seen
            this.db.list('chat', ref=> ref.child(this.authKey)).update(this.chatKey,{ unseenCount: 0 });
            data['unseenCount'] = 0;
          }

          this.geoStatus = {sender:data['geoStatus'], receiver:this.geoStatus.receiver}
          this.matchDate = data['createdDate'];
        })
      });

    this.chatObserver2 = this.db.list('chat', ref=> ref.child(this.receiverKey).orderByKey().equalTo(this.chatKey))
      .snapshotChanges().subscribe( snapshot =>{
        snapshot.forEach( element =>{
          let data = element.payload.val();
          data['id'] = element.key;
          this.geoStatus = {sender:this.geoStatus.sender, receiver:data['geoStatus']};
          this.unseenCount = data['unseenCount'];
        });
      });

    this.messageObserver = this.db.list('messages', ref=> ref.child(this.authKey).child(this.chatKey)
      .orderByChild('timestamp')).snapshotChanges().subscribe(snapshot => {
        let messageArr = []
        var messagePromise = new Promise(resolve =>{
          snapshot.forEach( element => {
            let data = element.payload.val();
            data['id'] = element.key;
            if(!data['isRead']){
              this.db.list('messages', ref=> ref.child(this.authKey).child(this.chatKey))
                .update(data['id'], { isRead:true });
            }
            if(data['status']){  //if message is not cleared
              messageArr.push(data);
            }
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
           data['id'] = element.payload.key;
           data['age'] = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
           this.chatProvider.userProfile = data;
           this.userProfile = data;
           this.userPhoto = data['photos'][0];
           this.userFirstName = data['firstName'];
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
    this.myMessage = '';
    this.db.list('messages', ref=> ref.child(this.authKey).child(this.chatKey)).push({
      message: sentMessage,
      sender: this.authKey,
      timestamp: sentDate,
      type: 'message',
      isRead: true,
      status: true
    }).then( messageValue =>{
      this.db.list('messages', ref => ref.child(this.receiverKey).child(this.chatKey))
        .set(messageValue.key,{
          message: sentMessage,
          sender: this.authKey,
          timestamp: sentDate,
          type: 'message',
          isRead: false,
          status: true
        });
    });
    this.db.list('chat', ref=> ref.child(this.authKey)).update(this.chatKey, {
      timestamp:sentDate
    });
    this.db.list('chat', ref=> ref.child(this.receiverKey)).update(this.chatKey, {
      timestamp:sentDate,
      unseenCount: this.unseenCount+1
    });
  }

  sendImage(){
    const options: CameraOptions = {
      quality: 30,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      // console.log(imageData);
      let sentDate = moment().valueOf();
      const filePath = `imageProfile/meetr-image_${ new Date().getTime() }.jpg`;
      const fileRef = this.storage.ref(filePath);
      let image = 'data:image/jpg;base64,' + imageData;
      this.loadingImage.push({
        date: sentDate,
        image: image
      });
      this.uploadTask = fileRef.putString(image, 'data_url')
      this.uploadObserver = this.uploadTask.percentageChanges().subscribe(value => {
        const maxLoad = 100;
        if(maxLoad === value){
          this.loadingImage = this.loadingImage.filter( obj =>{
            return obj.date!== sentDate
          });
          this.uploadObserver.unsubscribe();
        }
      });
      this.uploadTask.then(() =>{
          fileRef.getDownloadURL().subscribe(url => {  //get URL of image stored in firebase storage
           this.db.list('messages', ref=> ref.child(this.authKey).child(this.chatKey)).push({
            image: url,
            sender: this.authKey,
            timestamp: sentDate,
            type: 'image',
            isRead: true,
            status: true
          }).then( messageValue =>{
            this.db.list('messages', ref => ref.child(this.receiverKey).child(this.chatKey))
              .set(messageValue.key,{
                image: url,
                sender: this.authKey,
                timestamp: sentDate,
                type: 'image',
                isRead: false,
                status: true
              });
          });
          this.db.list('chat', ref=> ref.child(this.authKey)).update(this.chatKey, {
            timestamp:sentDate
          });
          this.db.list('chat', ref=> ref.child(this.receiverKey)).update(this.chatKey, {
            timestamp:sentDate,
            unseenCount: this.unseenCount+1
          });
        });
      }, (error) => {
        console.log("Sending image error", error);
        let toast = this.toastCtrl.create({
          message: "Sending image failed.",
          duration: 3000,
          position: 'top'
        });
        toast.present();
      });
    }, error =>{
      console.log("Image error", error);
    });
  }

  checkMessage(){
    this.messageEmpty = this.myMessage.trim() == ''? true:false;
  }

  displayImage(imageUrl){
    this.modalCtrl.create(ImageViewPage, {image: imageUrl}).present();
  }

  sendQuestion(){ 

  }

  gotoGeo(){
    this.navCtrl.push(UserGeoPage);
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopoverComponent, {
      chatKey: this.chatKey,
      userKey: this.receiverKey
    });
    popover.present({
      ev: myEvent
    });
  }
}
