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

  chatList = [];

  //Observer/Subscription
  chatObserver;
  constructor(public http: HttpClient, private db: AngularFireDatabase, private fireAuth: AngularFireAuth) {
    console.log('Hello ChatProvider Provider');
    this.getChat();
  }

  getChat(){
  	// this.db.list('chat', ref => ref.child(this.authKey).orderByChild('timestamp'))
  	// 	.query.once('value').then( snapshot => {
   //      let chatArray = [];
   //      snapshot.forEach(element =>{
   //        let data = element.val();
   //        data['id'] = element.key;
   //        this.db.list('profile', ref=> ref.child(data['receiver'])).query.once('value', profileSnap => {
   //            let profileData = profileSnap.val();
   //            data['firstName'] = profileData.firstName;
   //            data['lastName'] = profileData.lastName;
   //            data['userImage'] = profileData.photos[0];
   //            data['userKey'] = profileSnap.key;
   //        })
   //        this.db.list('messages', ref=> ref.child(this.authKey).child(data['id']).orderByChild('timestamp').limitToLast(1))
   //          .query.once('value', messageSnap =>{
   //            messageSnap.forEach( element =>{  //only returns one, foreach to include checking if got 1
   //              let messageData = element.val();
   //              Object.assign(data, messageData);
   //              let message = ((data['sender'] === this.authKey)? "You: " : (data['firstName']+": "))+data['message'];
   //              data['message'] = (message.length>25 ? message.substring(0, 25)+"..." : message);
   //              data['messageDate'] = this.messageDateFormat(data['timestamp']);
   //            });
   //          chatArray.push(data);
   //        })
   //      });
   //      console.log(chatArray.reverse())
   //  });   
     // this.chatObserver = this.db.list('chat', ref => ref.child(this.authKey).orderByChild('timestamp'))
     //  .snapshotChanges().subscribe( snapshot => {
     //    let reversedSnap = snapshot.slice().reverse();
     //    let chatArray = [];
     //    reversedSnap.forEach( element =>{
     //      let data = element.payload.val();
     //      data['id'] = element.key;

     //      this.db.list('profile', ref=> ref.child(data['receiver'])).query.once('value', profileSnap => {
     //          let profileData = profileSnap.val();
     //          data['firstName'] = profileData.firstName;
     //          data['lastName'] = profileData.lastName;
     //          data['userImage'] = profileData.photos[0];
     //          data['userKey'] = profileSnap.key;
     //      })
     //      this.db.list('messages', ref=> ref.child(this.authKey).child(data['id']).orderByChild('timestamp').limitToLast(1))
     //        .query.once('value', messageSnap =>{
     //          messageSnap.forEach( element =>{  //only returns one, foreach to include checking if got 1
     //            let messageData = element.val();
     //            Object.assign(data, messageData);
     //            let message = ((data['sender'] === this.authKey)? "You: " : (data['firstName']+": "))+data['message'];
     //            data['message'] = (message.length>25 ? message.substring(0, 25)+"..." : message);
     //            data['messageDate'] = this.messageDateFormat(data['timestamp']);
     //          });
     //        chatArray.push(data);  
     //      });
     //    });
     //    this.chatList = chatArray;
     //    console.log('heyprov');
     //  });
  }

  messageDateFormat(date){
    let dateNow = moment().valueOf();
    let dayUnix = 86400000;
    let weekUnix = 604800000;
    if((dateNow-date) < dayUnix){
      return moment(date).format("LT");
    }
    else if((dateNow-date) > dayUnix && (dateNow-date) < weekUnix){
      return moment(date).format("ddd LT");
    }
    else if((dateNow-date) > weekUnix){
      return moment(date).format("MMM D");
    }

  }
  
}
