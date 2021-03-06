import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';

//Providers
import { AuthProvider } from '../../providers/auth/auth';
import { ChatProvider } from '../../providers/chat/chat';
/**
 * Generated class for the LocationRequestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-location-request',
  templateUrl: 'location-request.html',
})
export class LocationRequestPage {
  authKey = this.authProvider.authUser;
  chatKey = this.chatProvider.chatKey;
  receiverKey = this.chatProvider.receiverKey;
  meetupDetails = this.chatProvider.meetupRequest;
  allRequests = this.chatProvider.allrequests;

  placeDetails: any;
  coordinates: any;
  isExpired:boolean;

  map:any;
  formMarker;
  @ViewChild('map') mapRef: ElementRef;

  placesService;

  //Observer/Subscription
  trackGeo;
  meetupObserver;  //for current meetup
  meetupObserver2; //for all meetups
  constructor(public navCtrl: NavController, public navParams: NavParams, private chatProvider: ChatProvider, 
    private authProvider: AuthProvider, private geolocation: Geolocation, private db: AngularFireDatabase,
    private view: ViewController, private toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocationRequestPage');
    console.log(this.meetupDetails);
    this.trackLocation();
    this.showMap();
    this.checkCurrentMeetup();
  }

  ionViewWillUnload(){
    // this.trackGeo.unsubscribe()
    this.meetupObserver.unsubscribe();
  }

  showMap(){
    var image = "../../../assets/imgs/markerfinal.png";
    let mapOptions = {      //map options
        zoom:10,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        mapTypeControl:false,
        streetViewControl:false,
        fullscreenControl:false,
      }

    this.map = new google.maps.Map(this.mapRef.nativeElement, mapOptions);
    this.placesService = new google.maps.places.PlacesService(this.map);
    let request =  {
      placeId: this.meetupDetails.placeId,
      fields: ['name', 'formatted_address', 'place_id', 'geometry', 'types']
    };
    this.placesService.getDetails(request, (place, status) => {
      console.log(place);
      this.placeDetails = {
        latLng: place.geometry.location,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        address: place.formatted_address,
        name: place.name,
        placeId: place.place_id
      }
      this.map.setCenter(this.placeDetails.latLng);
      this.map.setZoom(17);
      this.formMarker = new google.maps.Marker({
          position: this.placeDetails.latLng,
          map: this.map,
          //icon:image,
      });
        // let latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
    })
    
  }

  trackLocation(){
    // this.trackGeo = this.geolocation.watchPosition({enableHighAccuracy: true})
   //    .subscribe( data => {
   //      this.coordinates = {
   //        lat: data.coords.latitude,
   //        lng: data.coords.longitude
   //      }
   //    })
  }

  checkCurrentMeetup(){
    this.meetupObserver = this.db.list('meetups', ref=>ref.child(this.chatKey).orderByKey().equalTo(this.meetupDetails.id))
      .snapshotChanges().subscribe( snapshot =>{
        snapshot.forEach(element =>{
          let data = element.payload.val();
          data['id'] = element.key;
          this.meetupDetails = data;
        });
      });
    this.meetupObserver2 = this.db.list('userMeetups', ref=> ref.orderByKey().equalTo(this.authKey))
      .snapshotChanges().subscribe(snapshot =>{
        let reversedSnap = snapshot.slice().reverse();
        let meetups = [];
        var meetupPromise = new Promise(resolve =>{
          reversedSnap.forEach(element => {
            let data = element.payload.val();
            data['id'] = element.key;
            meetups.push(data);
          });
        });
        meetupPromise.then(() =>{
          this.allRequests = [];
          this.allRequests = meetups;
        });
      });
  }

  acceptRequest(){
    let sameDateIndex = this.allRequests.findIndex(x => !x.isCancelled && x.date === this.meetupDetails.date 
      && (x.status === "Ongoing" || x.status === "Success"));
    if(sameDateIndex === -1){
      if(this.meetupDetails.isCancelled){
        this.db.list('userMeetups', ref=> ref.child(this.authKey)).update(this.meetupDetails.id, {
          receiverStatus: 'Accepted',
          action:{
              method: 'accept',
              actor: this.authKey,
              isShown: true
            },
          status:'Ongoing'
        })
        this.db.list('userMeetups', ref=> ref.child(this.receiverKey)).update(this.meetupDetails.id, {
          receiverStatus: 'Accepted',
          action:{
              method: 'accept',
              actor: this.authKey,
              isShown: false
            },
          status:'Ongoing'
        });
        this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.meetupDetails.id, {
          receiverStatus: 'Accepted',
          status: 'Ongoing'
        });
        let toast = this.toastCtrl.create({
          message: "Meetup request accepted.",
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
      else{
        let toast = this.toastCtrl.create({
          message: "Failed to accept meetup request.",
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
      this.view.dismiss();
    }
    else{
      let toast = this.toastCtrl.create({
          message: "Date already scheduled.",
          duration: 2000,
          position: 'top'
        });
        toast.present();
    }
    
  }

  declineRequest(){
    if(this.meetupDetails.isCancelled){
      this.db.list('userMeetups', ref=> ref.child(this.authKey)).update(this.meetupDetails.id, {
        receiverStatus: 'Declined',
        action:{
            method: 'decline',
            actor: this.authKey,
            isShown: true
          },
        status: 'Declined'
      });
      this.db.list('userMeetups', ref=> ref.child(this.authKey)).update(this.meetupDetails.id, {
        receiverStatus: 'Declined',
        action:{
            method: 'decline',
            actor: this.authKey,
            isShown: false
          },
        status: 'Declined'
      });
      this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.meetupDetails.id, {
        receiverStatus: 'Declined',
        status: 'Declined'
      });
      let toast = this.toastCtrl.create({
        message: "Meetup request declined.",
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
    else{
      let toast = this.toastCtrl.create({
        message: "Failed to decline meetup request.",
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
    this.view.dismiss();
  }

  cancelMeetup(){
    this.db.list('userMeetups', ref=> ref.child(this.authKey)).update(this.meetupDetails.id,{
      isCancelled: true,
      action:{
          method: 'cancel',
          actor: this.authKey,
          isShown: true
        }
    });
    this.db.list('userMeetups', ref=> ref.child(this.receiverKey)).update(this.meetupDetails.id,{
      isCancelled: true,
      action:{
          method: 'cancel',
          actor: this.authKey,
          isShown: false
        }
    });
    this.db.list('meetups', ref=> ref.child(this.chatKey)).update(this.meetupDetails.id,{
      isCancelled: true
    });
    let toast = this.toastCtrl.create({
      message: "Meetup request cancelled.",
      duration: 2000,
      position: 'top'
    });
    this.view.dismiss();
  }

}
