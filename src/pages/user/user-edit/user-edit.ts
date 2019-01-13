import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProfilePage } from '../user-profile/user-profile';
import { Camera, CameraOptions } from '@ionic-native/camera';
/**
 * Generated class for the UserEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-edit',
  templateUrl: 'user-edit.html',
})
export class UserEditPage {

  myPhoto:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private camera: Camera) {
  }

  //testing
  takePhoto(){
    const options: CameraOptions = {
      quality: 70,
      cameraDirection:1,
      saveToPhotoAlbum:true,
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
      cameraDirection:1,
      saveToPhotoAlbum:true,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    }
    this.camera.getPicture(options).then((imageData) => {
      this.myPhoto = 'data.image/jpeg;base64,' + imageData;
    }, (err) => {
      alert("Error");
    });
  }
  //testing

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserEditPage');
  }
  goBack(){
  	this.navCtrl.push(UserProfilePage);
  }
}
