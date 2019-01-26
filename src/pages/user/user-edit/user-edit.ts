import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

//Page
import { UserProfilePage } from '../user-profile/user-profile';

//Plugin
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
// import { storage } from 'firebase';
import { Camera, CameraOptions } from '@ionic-native/camera';

//Providers
import { UserProvider } from '../../../providers/user/user';
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
  //Display variables
  interests = [];
  profileImages = [];
  bio: string = "";
  isMale: boolean;
  isFemale: boolean;
  currentImage:string;

  //Element variables
  interestInputValue: string = "";
  isUploading: boolean = false;
  uploadTask: AngularFireUploadTask;

  constructor(public navCtrl: NavController, public navParams: NavParams, private fireAuth: AngularFireAuth, 
    private db: AngularFireDatabase, private userProvider: UserProvider, private camera: Camera, private storage: AngularFireStorage) {
  }

  ionViewDidLoad() {
    this.loadProfile();
    console.log('ionViewDidLoad UserEditPage');
  }
  goBack(){
    this.navCtrl.push(UserProfilePage);
  }

  loadProfile(){
    this.db.list('profile', ref => ref.orderByKey().equalTo(this.fireAuth.auth.currentUser.uid))
      .snapshotChanges().subscribe( snapshot => {  //Angularfire2
        var data = snapshot[0].payload.toJSON();
        this.bio = data['bio'];
        this.interests = Object.assign([], data['interests']);
        this.isMale = data['gender'].male;
        this.isFemale = data['gender'].female;
        this.profileImages = Object.assign([], data['photos']);
      });
  }
  addInterest(interest){
    // console.log(this.interestInput._value);
    // this.interestInput.clearTextInput();
    this.interests.push(interest);
    this.interestInputValue = null;
    this.dbUpdateProfile();
  }
  deleteInterest(interestIndex){
    if(this.interests.length > 1){
      this.interests.splice(interestIndex, 1);
      this.dbUpdateProfile();
    }
  }
  dbUpdateProfile(){  //Update all values in profile
    this.db.list('profile').update(this.fireAuth.auth.currentUser.uid, {
      interests: this.interests,
      bio: this.bio,
      gender: {
         male: this.isMale,
         female: this.isFemale
      },
      photos: this.profileImages
    });
  }
  bioChanged(){
    this.dbUpdateProfile();
  }
  chooseMale(){
    this.isFemale = !this.isMale;
    this.dbUpdateProfile();
  }
  chooseFemale(){
    this.isMale = !this.isFemale;
    this.dbUpdateProfile();
  }

  uploadPhoto(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      // encodingType: this.camera.EncodingType.JPEG,
      // mediaType: this.camera.MediaType.PICTURE
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      targetHeight: 300,
      targetWidth: 300
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      const filePath = `imageProfile/meetr-image_${ new Date().getTime() }.jpg`;
      const fileRef = this.storage.ref(filePath);
      this.currentImage = 'data:image/jpg;base64,' + imageData;

      this.uploadTask = fileRef.putString(this.currentImage, 'data_url');  //Send image to firebase storage
      this.uploadTask.then( () =>{    
        fileRef.getDownloadURL().subscribe(url => {  //get URL of image stored in firebase storage
          this.profileImages.push(url);
          this.dbUpdateProfile();
        });
      })
      this.uploadTask.percentageChanges().subscribe(value => {
        const maxLoad = 100;
        // this.isUploading = maxLoad === value ? false: true;
        if(maxLoad === value){
          // setTimeout(()=>{    //this is a simple hack for displaying issues
            this.isUploading = false;
          // }, 700);  //0.7 seconds refresh for image
        }
        else{
          this.isUploading = true;
        }
      });
    }, (error) => {
      console.log("Upload Error: ", error);
    });
  }

  deletePhoto(photoIndex, imageURL){
    if(this.profileImages.length > 1){
      this.profileImages.splice(photoIndex, 1);
      // console.log(this.storage.storage.refFromURL(imageURL))

      try{  //try catch if image is not found in storage  //temporarily
        this.storage.storage.refFromURL(imageURL).delete();//remove from firebase storage by URL
      }
      catch(error){
        console.log(error);
      }
      this.dbUpdateProfile();
    }
  }

  emptyImageCounter(numImages){
    let maxImages = 6;
    return new Array((maxImages-numImages));
  }
}
