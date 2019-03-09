import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController} from 'ionic-angular';

//Plugin
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import firebase from 'firebase';
//Providers
import { AuthProvider } from '../../../providers/auth/auth';
/**
 * Generated class for the UserAddMomentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-add-moment',
  templateUrl: 'user-add-moment.html',
})
export class UserAddMomentPage {
	authKey = this.authProvider.authUser;
	image = this.navParams.get('image');
	caption = "";
	isPosting = false;
	imageUrl = '';
	loader;
  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, public authProvider: AuthProvider,
  	private storage: AngularFireStorage, public loadingCtrl: LoadingController, public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserAddMomentPage');
  }

  postMoment(){
  	this.loader = this.loadingCtrl.create({
      content: 'Posting moment...'
    });
    this.loader.present();
  	const filePath = `imageMoments/meetr-image_${ new Date().getTime() }.jpg`;
  	const fileRef = this.storage.ref(filePath);
  	let uploadTask = fileRef.putString(this.image, 'data_url');  //Send image to firebase storage
  	let uploadObserver = uploadTask.percentageChanges().subscribe(value => {
	    const maxLoad = 100;
	    if(maxLoad === value){
	    	fileRef.getDownloadURL().subscribe(url => {  //get URL of image stored in firebase storage
		    	this.imageUrl = url;
		    	this.db.list('moments', ref=>ref.child(this.authKey)).push({
			  		image: this.imageUrl,
			  		caption: this.caption.trim(),
			  		timestamp: firebase.database.ServerValue.TIMESTAMP,
			  		status:true
			  	}).then(()=>{
			  		this.loader.dismiss();
			  		this.navCtrl.pop().then(() =>{
			  			let toast = this.toastCtrl.create({
			              message: "Successfully Posted.",
			              duration: 1000,
			              position: 'top',
			            });
			            toast.present();
			  			// uploadObserver.unsubscribe();
			  		});
			  	});
		    }, error =>{
		    	console.log(error);
		    	this.loader.dismiss();
		  		this.navCtrl.pop().then(() =>{
		  			let toast = this.toastCtrl.create({
		              message: "Error posting moment. Please try again.",
		              duration: 1000,
		              position: 'top',
		            });
		            toast.present();
		  			// uploadObserver.unsubscribe();
		  		});
		    });
	    }
	  }, error =>{
	  	console.log(error)
	  	this.loader.dismiss();
  		this.navCtrl.pop().then(() =>{
  			let toast = this.toastCtrl.create({
              message: "Error posting moment. Please try again.",
              duration: 1000,
              position: 'top',
            });
            toast.present();
  			// uploadObserver.unsubscribe();
  		});
	  });
  }
}
