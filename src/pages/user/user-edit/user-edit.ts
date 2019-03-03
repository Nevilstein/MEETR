import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, TextInput} from 'ionic-angular';

//Page
import { UserProfilePage } from '../user-profile/user-profile';
import { UserInterestPage } from '../user-interest/user-interest';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
// import { storage } from 'firebase';
import { Camera, CameraOptions } from '@ionic-native/camera';
import moment from 'moment';

//Providers
import { AuthProvider } from '../../../providers/auth/auth';
import { UserProvider } from '../../../providers/user/user';

//Providers
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

  authUser = this.authProvider.authUser;

  //Display variables
  interests = [];
  profileImages = [];
  bio: string = "";
  isMale: boolean;
  isFemale: boolean;
  currentImage:string;
  category = [];
  questions = [];
  backQuestions = [];

  // quizDuration = 7*86400000; //7 days in milliseconds is the duration of all questions
  

  //Element variables
  interestInputValue: string = "";
  isUploading: boolean = false;
  uploadTask: AngularFireUploadTask;
   @ViewChild('myInput') myInput: ElementRef;
   @ViewChild('bioText') textbox: TextInput;

  //Observer/Subscription
  profileObserver;
  answerObserver;
  imageObserver;
  uploadObserver;
  constructor(public navCtrl: NavController, public navParams: NavParams, private fireAuth: AngularFireAuth, 
    private db: AngularFireDatabase, private camera: Camera, private storage: AngularFireStorage, 
    private authProvider: AuthProvider, private modalCtrl: ModalController, private userProvider: UserProvider) {
    
  }

  ionViewDidLoad() {
    this.loadProfile();
    // this.loadAnswers();
    console.log('ionViewDidLoad UserEditPage');
  }
  ionViewWillUnload(){
    this.profileObserver.unsubscribe();
    // this.answerObserver.unsubscribe();
  }

  goBack(){
    this.navCtrl.push(UserProfilePage);
  }

  loadProfile(){
    this.profileObserver = this.db.list('profile', ref => ref.orderByKey().equalTo(this.authUser))
      .snapshotChanges().subscribe( snapshot => {  //Angularfire2
        var data = snapshot[0].payload.toJSON();
        this.bio = data['bio'];
        this.interests = Object.assign([], data['interests']);
        this.isMale = data['gender'].male;
        this.isFemale = data['gender'].female;
        this.profileImages = Object.assign([], data['photos']);
        this.userProvider.getUserProfile();
        // this.interestList = this.interests.concat(this.interestList);  //add interests shown in option
        // this.interestList = this.removeDuples(this.interestList);
      });
  }
  // loadAnswers(){
  //   this.answerObserver = this.db.list('answers', ref=> ref.child(this.authUser).orderByChild('timestamp')
  //     .limitToLast(10)).snapshotChanges().subscribe(snapshot =>{
  //       let dateNow = moment().valueOf();
  //       let quizList = [];
  //       snapshot.forEach(element => {
  //         let data = element.payload.val();
  //         data['answerKey'] = element.key;
  //         if((dateNow-data['timestamp'])<this.quizDuration){
  //           quizList.push(data);
  //         }
  //       });
  //       this.questions = quizList;
  //       this.backQuestions = quizList;
  //     });
  // }
  // removeDuples(interests){
  //   let newList = [];
  //   interests.forEach( element =>{
  //     if(!(newList.indexOf(element) > -1)){
  //       newList.push(element);
  //     }
  //   });
  //   return newList;
  // }
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
    this.db.list('profile').update(this.authUser, {
      interests: this.interests,
      bio: this.bio.trim(),
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
      targetHeight: 960,
      targetWidth: 960 
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      console.log(imageData);
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
      this.uploadObserver = this.uploadTask.percentageChanges().subscribe(value => {
        const maxLoad = 100;
        if(maxLoad === value){
            this.isUploading = false;
            this.uploadObserver.unsubscribe();
        }
        else{
          this.isUploading = true;
        }
      })
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
  get_category(category){
    for(var i=0; i<category.length; i++){
      this.category.push(category[i]);
    }
  }
  editInterest(){
    let modal = this.modalCtrl.create(UserInterestPage);
    modal.present();
  }
}
