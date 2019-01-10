import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../../login/login';
import { UserEditPage } from '../user-edit/user-edit';
import { UserSettingPage } from '../user-setting/user-setting';
import { Facebook } from '@ionic-native/facebook';
import { Camera, CameraOptions } from '@ionic-native/camera';

/**
 * Generated class for the UserProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  
  myPhoto:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private fb:Facebook, private camera:Camera) {
  }
  //testing
  takePhoto(){
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {
      this.myPhoto = 'data.image/jpeg;base64,' + imageData;
    }, (err) => {
      alert("Error");
    });
  }

  uploadPhoto(){
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum:false 
    }
    this.camera.getPicture(options).then((imageData) => {
      this.myPhoto = 'data.image/jpeg;base64,' + imageData;
    }, (err) => {
      alert("Error");
    });
  }
  //testing

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserProfilePage');
  }

  facebookLogout(){
    this.fb.logout().then( res => {
      alert("Logged out.");
      this.navCtrl.push(LoginPage);
    });
  }

  goBack(){
    this.navCtrl.push(LoginPage);
  }
  user_edit(){
    this.navCtrl.push(UserEditPage);
  }
  user_setting(){
    this.navCtrl.push(UserSettingPage);
  }

}
