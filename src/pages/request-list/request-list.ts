import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

//Pages
import { UserMeetupPage } from '../user/user-meetup/user-meetup';
import { LocationRequestPage } from '../location-request/location-request';
//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';
//Providers
import { AuthProvider } from '../../providers/auth/auth';
import { ChatProvider } from '../../providers/chat/chat';
/**
 * Generated class for the RequestListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-request-list',
  templateUrl: 'request-list.html',
})
export class RequestListPage {

  authKey: string = this.authProvider.authUser;
  chatKey: string = this.chatProvider.chatKey;
  receiverKey: string = this.chatProvider.receiverKey;

	requests = [];
	activeMeetup;
	activeIndex = -1;
	inactiveRequests = [];

  //Observer/Subscription
  meetupObserver;
  constructor(public navCtrl: NavController, public navParams: NavParams, public chatProvider: ChatProvider, public modalCtrl: ModalController,
    public db: AngularFireDatabase, public authProvider: AuthProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RequestListPage');
    let dateNow = moment().valueOf();
    let minutes = 900000;  //15 minutes allowance    
    if(this.chatProvider.requests.length > 0){
    	this.requests = this.chatProvider.requests;
    	this.inactiveRequests = this.requests.filter(item => {
    		return item.isCancelled || item.receiverStatus==="Declined" || item.senderStatus==="Declined" || item.status==="Fail" 
          || item.status==="Expired" || (item.status==="Success" && dateNow >= moment(item.date+" "+item.time).valueOf()+minutes);
    	});
    }
    this.activeIndex = this.requests.findIndex(x => !x.isCancelled && (x.receiverStatus!=="Declined" && x.senderStatus!=="Declined") &&
      x.status!=="Fail" && x.status!=="Expired" && dateNow < moment(x.date+" "+x.time).valueOf()+minutes);
    this.activeMeetup = this.requests[this.activeIndex];
    this.getRequests();
  }
  ionViewWillUnload(){
    this.meetupObserver.unsubscribe();
  }
  getRequests(){
    this.meetupObserver = this.db.list('meetups', ref => ref.child(this.chatKey)
      .orderByChild('timestamp')).snapshotChanges().subscribe(snapshot =>{
        let meetupArr = []
        var meetupPromise = new Promise(resolve =>{
          let reversedSnap = snapshot.slice().reverse();
          reversedSnap.forEach( (element, index) => {
              let data = element.payload.val();
              data['id'] = element.key;
              data['dateSent'] = moment(data['createdDate']).format("LL")
              meetupArr.push(data);
          });
          resolve(true);
        });
        meetupPromise.then(() =>{
          this.requests = meetupArr;
          let dateNow = moment().valueOf();
          let minutes = 900000;  //15 minutes allowance
          this.inactiveRequests = this.requests.filter(item => {
            return item.isCancelled || item.receiverStatus==="Declined" || item.senderStatus==="Declined" || item.status==="Fail" 
              || item.status==="Expired" || (item.status==="Success" && dateNow >= moment(item.date+" "+item.time).valueOf()+minutes);
          });
          this.activeIndex = this.requests.findIndex(x => !x.isCancelled && (x.receiverStatus!=="Declined" && x.senderStatus!=="Declined") &&
            x.status!=="Fail" && x.status!=="Expired" && dateNow < moment(x.date+" "+x.time).valueOf()+minutes);
          this.activeMeetup = this.requests[this.activeIndex];
        });
      });
  }
  selectRequest(meetupDetail){
    this.chatProvider.meetupRequest = meetupDetail;
    this.navCtrl.push(LocationRequestPage);
  }
  sendRequest(){
  	let modal = this.modalCtrl.create(UserMeetupPage);
    modal.present();
  }
}
