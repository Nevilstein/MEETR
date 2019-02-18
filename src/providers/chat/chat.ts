import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


//Plugins
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import moment from 'moment';
/*
  Generated class for the ChatProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ChatProvider {
  authKey = this.fireAuth.auth.currentUser.uid;
  chatKey: string;
  receiverKey: string;
  userProfile:any;
  geoStatus:boolean;

  myLocation: any;
  meetupRequest: any;
  // chatList = [];

  //Observer/Subscription
  // chatObserver;
  constructor(public http: HttpClient, private db: AngularFireDatabase, private fireAuth: AngularFireAuth) {
    console.log('Hello ChatProvider Provider');
    // this.getChat();
  }

  // getChat(){
    
  // }

  // messageDateFormat(date){
  //   let dateNow = moment().valueOf();
  //   let dayUnix = 86400000;
  //   let weekUnix = 604800000;
  //   if((dateNow-date) < dayUnix){
  //     return moment(date).format("LT");
  //   }
  //   else if((dateNow-date) > dayUnix && (dateNow-date) < weekUnix){
  //     return moment(date).format("ddd LT");
  //   }
  //   else if((dateNow-date) > weekUnix){
  //     return moment(date).format("MMM D");
  //   }

  // }
  
}
