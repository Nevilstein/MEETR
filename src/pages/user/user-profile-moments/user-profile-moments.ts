import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

//Pages
import { UserAddMomentPage } from '../user-add-moment/user-add-moment';
import { UserViewMomentPage } from '../user-view-moment/user-view-moment';
//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import { Camera, CameraOptions } from '@ionic-native/camera';
import moment from 'moment';
//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { UserProvider } from '../../../providers/user/user';
import { MomentProvider } from '../../../providers/moment/moment';
/**
 * Generated class for the UserProfileMomentsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-profile-moments',
  templateUrl: 'user-profile-moments.html',
})
export class UserProfileMomentsPage {
	authKey = this.authProvider.authUser;
	profile = this.userProvider.authProfile;
	moments = [];

	//Observer/Subscription
	momentObserver;
  constructor(public navCtrl: NavController, public navParams: NavParams, public userProvider:UserProvider,
  	public authProvider: AuthProvider, public db: AngularFireDatabase, private camera: Camera, public modalCtrl: ModalController,
  	public momentProvider: MomentProvider) {
  	this.moments = this.userProvider.myMoments;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserProfileMomentsPage');
   	this.getMoments();
  }

  ionViewWillUnload(){
    this.momentObserver.unsubscribe();
  }
  getMoments(){
  	this.momentObserver = this.db.list('moments', ref => ref.child(this.authKey).orderByChild('timestamp'))
      .snapshotChanges().subscribe( snapshot => {
        let reverseSnap = snapshot.slice().reverse();
        let allMoments = [];
        reverseSnap.forEach( element =>{
          let data = element.payload.val();
          data['id'] = element.key;
          data['date'] = moment(data['timestamp']).format('MMMM DD, YYYY');
          if(data['status']){
            allMoments.push(data);
          }
        });
        this.moments = allMoments;
      });
  }

  addMoment(){
  	const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      targetWidth:1920,
      targetHeight:1080,
      correctOrientation: true,
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let image = 'data:image/jpg;base64,' + imageData;
      this.navCtrl.push(UserAddMomentPage, {image: image});
    }, (error) => {
      console.log("Upload Error: ", error);
    });
  }

  seeMoment(momentDetails){
  	this.momentProvider.currentMoment = momentDetails;
  	let modal = this.modalCtrl.create(UserViewMomentPage);
  	modal.present();
  }
  deleteMoment(momentId){
    this.db.list('moments', ref=> ref.child(this.authKey)).update(momentId, {
      status: false
    });
  }
}
