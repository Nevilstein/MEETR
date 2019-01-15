import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Facebook } from '@ionic-native/facebook';
import { Observable } from 'rxjs/observable';
import moment from 'moment';

/*
  Generated class for the UserProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserProvider {
	loading = true;
	profile = [];
	constructor(public http: HttpClient, private db: AngularFireDatabase, private fb: Facebook, public afAuth: AngularFireAuth) {
		console.log('Hello UserProvider Provider');
		// this.afAuth.authState.subscribe(res => {
		// 	this.authKey = res.uid;
		// });
	}

	// getCurrentUser(){
	// 	return this.afAuth.authState.map((auth) =>  {
	//     	if(auth === null){
	//     		return false;
	//     	}
	//     	else{
	//     		return auth.uid;
	//     	}
	//     });
	// }

	getUserProfile(){
		//Firebase data
		// var promise = new Promise((resolve, reject) => {
			// this.db.database.ref('profile').child(this.afAuth.auth.currentUser.uid).on('value', snapshot =>{
			// 	var data = snapshot.val();
			// 	data.id = snapshot.key;
			// 	resolve(data);
			// }, error => {
			// 	reject(error);
			// });
		// })
		// return promise;
		
		// var promise = new Promise((resolve, reject) => {
		// 	this.db.list('profile', ref => ref.orderByKey().equalTo(this.afAuth.auth.currentUser.uid)).snapshotChanges().subscribe( snapshot =>{
		//       var data = snapshot[0].payload.toJSON();
		//       data['id'] = snapshot[0].key;
		//       resolve(data);
		//     }, error =>{
		//     	reject(error);
		//     });
		// });
		// return promise;

		return this.db.list('profile', ref => ref.orderByKey().equalTo(this.afAuth.auth.currentUser.uid));	//Angularfire2
		// return this.db.database.ref('profile').child(this.afAuth.auth.currentUser.uid); //Classic Firebase
	}

	

	getFbProfile(){
		var promise = new Promise((resolve, reject) => {
			this.fb.api("/"+this.afAuth.auth.currentUser.providerData[0].uid+"/?fields=first_name, birthday",["public_profile"])
		      .then(res => {
		        res['age'] = moment().diff(moment(res.birthday, "MM/DD/YYYY"), 'years');
		        resolve(res);
		      })
		      .catch(err => {
		       	reject(err);
		      });
		})
		return promise;
	}

	// getProfile(){
	// 	var promise = new Promise((resolve, reject) => {
	// 		this.getUserProfile().then(authRes => {
	// 			this.getFbProfile().then( fbRes => {
	// 				var data = Object.assign({}, authRes, fbRes);
	// 				resolve(data);
	// 			}).catch(err =>{
	// 				reject(err);
	// 			});
	// 		}).catch(err =>{
	// 			reject(err);
	// 		});
	// 	})
	// 	return promise;
	// }


	// snapshotToArray = snapshot =>{
	// 	let returnArr = [];

	// 	snapshot.forEach( item =>{
	// 		let returnArr = item.payload.toJSON();
	// 		returnArr.id = item.key;
	// 		this.profile.push(returnArr);
	// 	});

	// 	return returnArr;
	// }
}
