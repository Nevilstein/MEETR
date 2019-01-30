import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

//Pages

//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import moment from 'moment';
/*
  Generated class for the UserProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserProvider {
	authProfile;
  constructor(public http: HttpClient, private db: AngularFireDatabase, private fireAuth: AngularFireAuth) {
    console.log('Hello UserProvider Provider');
    this.getUserProfile();
  }

  getUserProfile(){
  	this.db.list('profile', ref => ref.child(this.fireAuth.auth.currentUser.uid))
  		.query.once('value', snapshot =>{
  			let data = snapshot.val();
  			data.id = snapshot.key;
  			data.age = moment().diff(moment(data['birthday'], "MM/DD/YYYY"), 'years');
  			this.authProfile = data;
  		});
  }
}
