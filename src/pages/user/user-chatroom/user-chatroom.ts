import { Component, ViewChild, ElementRef, NgZone} from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, 
  Content, TextInput, ToastController, List, ModalController} from 'ionic-angular';

//Pages
import { UserGeoPage } from '../user-geo/user-geo';
import { UserMeetupPage } from '../user-meetup/user-meetup';
import { UserCheckPage } from '../user-check/user-check';
import { LocationSelectPage } from '../../location-select/location-select';
import { LocationRequestPage } from '../../location-request/location-request';
import { RequestListPage } from '../../request-list/request-list';
import { ImageViewPage } from '../../image-view/image-view';
import { PopoverComponent } from '../../../components/popover/popover';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';
import firebase from 'firebase';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';

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
  show=false;
  authKey: string = this.authProvider.authUser;
  chatKey: string = this.chatProvider.chatKey;
  receiverKey: string = this.chatProvider.receiverKey;
  chatLoading: boolean = true;
  myMessage:string = '';
  messages = this.chatProvider.messages;
  questions = [];
  imageMessage = [];
  loadingImage = [];
  requests = [];
  messageEmpty: boolean = true;
  geoStatus = { sender: null, receiver: null}
  matchDate;
  unseenCount:number;
  uploadTask:AngularFireUploadTask;
  // hasMeetup:boolean = true;
  isBottom: boolean = true;   //if content scroll is at bottom
  activeMeetup;
  activeIndex = -1;

  userPhoto: string;
  userFirstName: string;
  userStatus: boolean;
  activeWhen: string;
  statusDate: number;
  isActive: boolean;
  userProfile;
  // meetDetails;

  //Elements
  lineCount = 1; //for textarea
  textHeight = 0;
  // textIncrease

  //Observer/Subscription
  chatObserver;
  chatObserver2;
  messageObserver;
  activeObserver;
  profileObserver;
  questionObserver;
  uploadObserver;
  meetupObserver;
  scrollObserver;
  timeInterval;  //gets the active time interval of user while in chat
  expireInterval;

  //Promises
  profilePromise: Promise<boolean>;
  activePromise: Promise<boolean>;


  @ViewChild(Content) content: Content;
  @ViewChild('message') textbox: TextInput;
  @ViewChild(List, {read: ElementRef}) chatList: ElementRef;
  private mutationObserver: MutationObserver;

  constructor(public navCtrl: NavController,public popoverCtrl:PopoverController , public navParams: NavParams, 
    private db: AngularFireDatabase, private authProvider: AuthProvider, private chatProvider: ChatProvider, 
    private camera: Camera, private storage: AngularFireStorage, private toastCtrl: ToastController,
    private modalCtrl: ModalController, private imagePicker: ImagePicker, private zone:NgZone) {
    
  }
  ionViewWillLoad(){
    this.getUserData();
    this.getChatData();
    this.getMeetups();

    this.timeInterval = setInterval(() =>{
      this.activeWhen = this.getActiveStatus();  
    }, 60000)
    this.expireInterval = setInterval(() =>{
      let dateNow = moment().valueOf();
      let minutes = 900000;  //15 minutes allowance
      if(this.activeIndex > -1){
        if(dateNow >= moment(this.activeMeetup.date+" "+this.activeMeetup.time).valueOf()+minutes){
          this.activeIndex = -1;  //to avoid conflicts on slow writing of data
          let chatID = this.chatKey;  // to avoid conflicts when chatroom is closed
          let userID = this.receiverKey;
          let meetupID = this.activeMeetup.id;
          if(this.activeMeetup.status === "Ongoing"){
            this.db.list('meetups', ref=> ref.child(chatID)).update(meetupID, {
              status: "Fail"
            }).then(()=>{
              this.db.list('UserMeetups', ref=> ref.child(this.authKey)).update(meetupID, {
                status: "Fail"
              });
              this.db.list('UserMeetups', ref=> ref.child(userID)).update(meetupID, {
                status: "Fail"
              });
            }).then(() =>{
              let toast = this.toastCtrl.create({
                message: "Meetup is not accomplished.",
                duration: 2000,
                position: 'top'
              });
              toast.present();
            });
          }
          else if(this.activeMeetup.status === "Pending"){
            this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.activeMeetup.id, {
              status: "Expired"
            }).then(()=>{
              this.db.list('UserMeetups', ref=> ref.child(this.authKey)).update(meetupID, {
                status: "Expired"
              });
              this.db.list('UserMeetups', ref=> ref.child(userID)).update(meetupID, {
                status: "Expired"
              });
            }).then(() =>{
              let toast = this.toastCtrl.create({
                message: "Meetup request has expired.",
                duration: 2000,
                position: 'top'
              });
              toast.present();
            });
          }
        }
      }
    }, 1000);
    this.mutationObserver = new MutationObserver((mutations) => {
        this.content.scrollToBottom(0);
    });

    this.mutationObserver.observe(this.chatList.nativeElement, {
        childList: true
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad UserChatroomPage');
    this.content.scrollToBottom(0);
    this.textHeight = this.textbox._native.nativeElement.scrollHeight;
  }
  
  ionViewWillUnload(){
    this.activeObserver.unsubscribe();
    this.chatObserver.unsubscribe();
    this.chatObserver2.unsubscribe();
    this.messageObserver.unsubscribe();
    this.profileObserver.unsubscribe();
    // this.scrollObserver.unsubscribe();
    this.meetupObserver.unsubscribe();
    clearInterval(this.timeInterval);
    this.navCtrl.popToRoot();
  }

  getChatData(){
    console.log(this.chatKey);
    this.chatObserver = this.db.list('chat', ref=> ref.child(this.authKey).orderByKey().equalTo(this.chatKey))  //my chat
      .snapshotChanges().subscribe( snapshot =>{
        snapshot.forEach( element =>{
          let data = element.payload.val();
          data['id'] = element.key;
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
          //If meetups available and geostatus is not null, meaning not start of page and geostatus is changed
          if(this.geoStatus.receiver!==null && data['geoStatus']!==this.geoStatus.receiver){ 
            var message;
            if(data['geoStatus']){
              message = this.userFirstName+" can now be tracked on the map.";
            }
            else{
              message = this.userFirstName+" turned off location tracking.";
            }
            let toast = this.toastCtrl.create({
              message: message,
              duration: 2000,
              position: 'top'
            });
            toast.present();
          }
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
          setTimeout(() =>{
            this.contentScrolled();
          },300);
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
           this.userProfile = data;
           this.userPhoto = data['photos'][0];
           this.userFirstName = data['firstName'];
         });
         this.profilePromise = Promise.resolve(true);
      });
  }

  getMeetups(){
    this.meetupObserver = this.db.list('meetups', ref => ref.child(this.chatKey)
      .orderByChild('timestamp')).snapshotChanges().subscribe(snapshot =>{
        let reversedSnap = snapshot.slice().reverse();
        reversedSnap.forEach( (element, index) => {
            let dateNow = moment().valueOf();
            let data = element.payload.val();
            data['id'] = element.key;
            // let minutes = 1800000;  //30 minutes allowance
            // let dateTime = moment(data['date']+" "+data['time']).valueOf()+minutes;
            // data['hasStarted'] = (data['senderStatus']==='Accepted' && data['receiverStatus']==='Accepted')? true: false;
            // let isDeclined = (data['senderStatus']==='Declined' || data['receiverStatus']==='Declined')? true: false;
            // if(dateNow <= dateTime){
            //   if(!data['isCancelled'] && (!isDeclined || data['hasStarted'])){
            //     this.hasMeetup = true;
            //   }
            //   else{
            //     this.hasMeetup = false;
            //   }
              this.requests.push(data);
              // this.chatProvider.meetupRequest = data;  //pass latest meetUpRequest to chat provider
            // }
            // else{
            //   //expired update
            //   this.hasMeetup = false;
            // }
        });
        this.chatProvider.requests = this.requests;
        this.activeIndex = this.requests.findIndex(x => !x.isCancelled && (x.receiverStatus!=="Declined" && x.senderStatus!=="Declined"));
        this.activeMeetup = this.requests[this.activeIndex];
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
    var sentMessage = this.myMessage.trim();
    this.myMessage = '';
    this.lineCount = 1;
    this.textbox.setFocus();
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
    this.show = false;
    const options: CameraOptions = {
      quality: 60,
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

  // sendImage(){
  //   let options: ImagePickerOptions = {
  //     maximumImagesCount: 10,
  //     outputType: 1,
  //     quality: 50,
  //     width: 512,
  //     height: 512,
  //   }
  //   this.imagePicker.getPictures(options).then( results =>{
  //      for (let index = 0; index < results.length; index++) {  
  //           //here iam converting image data to base64 data and push a data to array value.  
  //           console.log('data:image/jpeg;base64,' + results[index]);  
  //       }
  //   });

  // }

  checkMessage(){
    // this.lineCount++;
    // console.log(this.myMessage);
    // this.textbox._native.nativeElement.rows = 3;
    let textarea = this.textbox._native.nativeElement;
    // console.log(this.textbox);
    // console.log("Scroll: ", textarea.scrollHeight);
    // console.log("Offset: ", textarea.offsetHeight);
    // console.log("Current height", this.textHeight);
    // let overflowCount = Math.floor(textarea.scrollHeight/(textarea.offsetHeight));
    // let newLineCount = this.myMessage.split('\n').length;
    // let totalRow = overflowCount+newLineCount;
    
    if(textarea.scrollHeight > this.textHeight){
      this.lineCount++;
    }
    this.textHeight = textarea.scrollHeight;
    if(this.lineCount<=4){
      textarea.rows = this.lineCount;
    }
    this.messageEmpty = this.myMessage.trim() == ''? true:false;
  }

  contentScrolled(){
    // console.log(this.content);
    // console.log("Scroll: ", this.content.scrollHeight);
    // console.log("Top: ", this.content.scrollTop);
    let dimensions = this.content.getContentDimensions();

    let scrollTop = this.content.scrollTop;
    let contentHeight = dimensions.contentHeight;
    let scrollHeight = dimensions.scrollHeight;

    
    this.zone.run(() =>{
      // this.isBottom = this.content.scrollTop+100 >= this.content.scrollHeight ? true: false;
      if ( (scrollTop + contentHeight + 200) > scrollHeight) {
        this.isBottom = true;
      } else {
        this.isBottom = false;
      }
    });
  }

  toBottom(){
    this.content.scrollToBottom();
  }

  displayImage(imageUrl){
    this.modalCtrl.create(ImageViewPage, {image: imageUrl}).present();
  }

  gotoGeo(){
    this.show = false;
    this.navCtrl.push(UserGeoPage);
  }

  meetup(){
    // this.navCtrl.push(LocationSelectPage);
    let modal = this.modalCtrl.create(UserMeetupPage);
    modal.present();
  }

  checkMeetup(){
   /* let modal = this.modalCtrl.create(LocationRequestPage);
    modal.present();*/
    // this.navCtrl.push(LocationRequestPage);
    this.show = false;
    this.navCtrl.push(RequestListPage);
  }

  checkProfile(){
    let modal = this.modalCtrl.create(UserCheckPage, {user: this.userProfile});
    modal.present();
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
  show_div(){
    this.show = !this.show;
  }
  geoChanged(){
    this.db.list('chat', ref => ref.child(this.authKey)).update(this.chatKey, {
      geoStatus: this.geoStatus.sender
    });
    if(this.geoStatus.sender){
      let toast = this.toastCtrl.create({
        message: "Location services is now available",
        duration: 1000,
        position: 'top',
        cssClass: 'location_avail'
      });
      toast.present();  
    }
    else{
      let toast = this.toastCtrl.create({
        message: "Location services is now unavailable",
        duration: 1000,
        position: 'top',
        cssClass: 'location_unavail'
      });
      toast.present();
    }
  }
}
