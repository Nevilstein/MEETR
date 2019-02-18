import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


import { AngularFireDatabase } from 'angularfire2/database';
import { Camera, CameraOptions } from '@ionic-native/camera';
import firebase from 'firebase';

import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the UserReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-report',
  templateUrl: 'user-report.html',
})
export class UserReportPage {
  authKey = this.authProvider.authUser;
  report: string;
  images = [];
  firebaseImages;
  reportMessage='';
  otherIssue: string;
  userKey = this.navParams.get('user');
  canSend: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, private view: ViewController, private camera: Camera, 
    private db: AngularFireDatabase, private authProvider: AuthProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserReportPage');
  }
  close_modal(){
  	this.view.dismiss();
  }

  issueChanged(){
    if(this.report.trim() === ''){
      this.canSend = false;
    }
    else{
      if(this.report !== 'Other'){
        this.canSend = true;
      }
    }
  }

  othersInput(){
    if(this.report === "Other" && this.otherIssue.trim() !== ''){
      this.canSend = true;
    }
    else{
      this.canSend = false;
    }
  }

  addPhoto(){
    const options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let image = 'data:image/jpg;base64,' + imageData;
      this.images.push(image);
      console.log(imageData);
    }, (error) => {
      console.log("Upload Error: ", error);
    });
  }

  sendReport(){
    this.images.forEach( image =>{
      console.log(image);
    });

    this.db.list('report').push({
      sender: this.authKey,
      userReported: this.userKey,
      issue: this.report,
      message: this.reportMessage,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }
}
