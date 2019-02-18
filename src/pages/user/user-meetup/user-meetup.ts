import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController, ViewController } from 'ionic-angular';

//Pages
import { LocationSelectPage } from '../../location-select/location-select';
import moment from 'moment';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { ChatProvider } from '../../../providers/chat/chat';
import firebase from 'firebase';
// import { DatePicker } from '@ionic-native/date-picker';
/**
 * Generated class for the UserMeetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-meetup',
  templateUrl: 'user-meetup.html',
})
export class UserMeetupPage {
  minDate = moment().format();
  maxDate = moment().add(1, 'years').format();
  date;
  time;
  location;
  hasLocation: boolean = false;
  authKey =  this.authProvider.authUser;
  chatKey = this.chatProvider.chatKey;
  receiverKey = this.chatProvider.receiverKey;

  isSent: boolean = false;
  meetUpData;

  map:any;
  formMarker;
  @ViewChild('map') mapRef: ElementRef;
  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController, 
    private toastCtrl: ToastController, private chatProvider: ChatProvider, private authProvider: AuthProvider,
    private db: AngularFireDatabase, private view: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserMeetupPage');
    this.showMap();
  }

  showMap(){
      let mapOptions = {      //map options
        zoom:10,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        mapTypeControl:false,
        streetViewControl:false,
        fullscreenControl:false,
      }
      this.map = new google.maps.Map(this.mapRef.nativeElement, mapOptions);

      let coordinates = {
        lat: 14.642425,
        lng: 120.9785022
      }
      let latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
      this.map.setCenter(latLng);
  }

  selectLocation(){
    let modal = this.modalCtrl.create(LocationSelectPage);
    modal.present();
    modal.onDidDismiss(data =>{
      if(data){
        if(data.location){
          this.location = data.location;
          if(this.formMarker){
            this.formMarker.setMap(null);
          }
          this.map.setCenter(this.location.latLng);
          this.map.setZoom(17);
          this.formMarker = new google.maps.Marker({
            position: this.location.latLng,
            map: this.map,
          });
          this.hasLocation = true;
        }
      }
    });
  }

  cancel(){
    this.navCtrl.pop();;
  }

  sendMeetup(){
    let dateNow = moment().valueOf();
    if(this.date && this.time && this.location){
      this.isSent = true;
      this.meetUpData = {
        date: this.date,
        time: this.time
      }
      this.meetUpData = Object.assign(this.meetUpData, this.location);
      console.log(this.meetUpData);  
      this.db.list('meetups', ref=> ref.child(this.chatKey)).push({
        date: this.meetUpData.date,
        time: this.meetUpData.time,
        location: {
          latitude: this.meetUpData.latitude,
          longitude: this.meetUpData.longitude
        },
        sender: this.authKey,
        receiver: this.receiverKey,
        placeId: this.meetUpData.placeId,
        receiverStatus: 'Pending',
        senderStatus: 'Accepted',
        isCancelled: false,
        createdDate: dateNow,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        hasArrived:{
          [this.authKey]: false,
          [this.receiverKey]: false,
        },
      }).then( uniqueSnap =>{
          this.db.list('userMeetups', ref=> ref.child(this.authKey)).set(uniqueSnap.key,{
            date: this.meetUpData.date,
            time: this.meetUpData.time,
            location: {
              latitude: this.meetUpData.latitude,
              longitude: this.meetUpData.longitude
            },
            sender: this.authKey,
            receiver: this.receiverKey,
            placeId: this.meetUpData.placeId,
            chatId: this.chatKey,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            receiverStatus: 'Pending',
            senderStatus: 'Accepted',
            isCancelled: false,
            createdDate: dateNow,
            action:{
              method: 'send',
              actor: this.authKey,
              isShown: true
            }
          });
          this.db.list('userMeetups', ref=> ref.child(this.receiverKey)).set(uniqueSnap.key,{
            date: this.meetUpData.date,
            time: this.meetUpData.time,
            location: {
              latitude: this.meetUpData.latitude,
              longitude: this.meetUpData.longitude
            },
            sender: this.authKey,
            receiver: this.receiverKey,
            placeId: this.meetUpData.placeId,
            chatId: this.chatKey,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            receiverStatus: 'Pending',
            senderStatus: 'Accepted',
            isCancelled: false,
            createdDate: dateNow,
            action:{
              method: 'send',
              actor: this.authKey,
              isShown: false
            }
          });
      }).then(() =>{
        this.view.dismiss();
        let toast = this.toastCtrl.create({
          message: "Request sent.",
          duration: 1000,
          position: 'bottom',
        });
        toast.present();
      });
    }
    else{
      let toast = this.toastCtrl.create({
          message: "Please enter meetup information.",
          duration: 1000,
          position: 'bottom',
        });
        toast.present();
    }
  }  
}
