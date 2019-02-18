import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController} from 'ionic-angular';


//Pages
import { UserGeoPage } from '../../pages/user/user-geo/user-geo';
import { UserCheckPage } from '../../pages/user/user-check/user-check';
import { UserReportPage } from '../../pages/user/user-report/user-report';

//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';
import firebase from 'firebase';

//Providers
import { AuthProvider } from '../../providers/auth/auth';
import { ChatProvider } from '../../providers/chat/chat';

/**
 * Generated class for the PopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent {

	authKey = this.authProvider.authUser;
	chatKey = this.chatProvider.chatKey;
	receiverKey = this.chatProvider.receiverKey;

  text: string;


  constructor(public navCtrl: NavController, private navParams: NavParams, private authProvider:AuthProvider, 
  	private db: AngularFireDatabase, private chatProvider:ChatProvider, private view: ViewController, 
    private modalCtrl: ModalController) {
  }

  gotoGeo(){
    this.navCtrl.push(UserGeoPage);
  }
   unmatch(){
    this.db.list('chat', ref=> ref.child(this.authKey)).update(this.chatKey, {    //auth user chat collection
      matchStatus: false
    });
    this.db.list('chat', ref=> ref.child(this.receiverKey)).update(this.chatKey, {    //user chat collection
      matchStatus: false
    });
    this.db.list('match', ref => ref.child(this.authKey)).remove(this.receiverKey);
    this.db.list('match', ref => ref.child(this.receiverKey)).remove(this.authKey);
    this.view.dismiss();
  }

  clearChat(){
    this.db.list('messages', ref=> ref.child(this.authKey).child(this.chatKey))
      .query.once('value').then( snapshot =>{
        snapshot.forEach( element =>{
          this.db.list('messages', ref=> ref.child(this.authKey).child(this.chatKey)).update(element.key, {
            status: false
          });
        })
        this.db.list('chat', ref=> ref.child(this.authKey)).update(this.chatKey, {
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });
      });
    this.view.dismiss();
  }
  reportUser(){
    let modal = this.modalCtrl.create(UserReportPage, {user: this.receiverKey});
    modal.present();
  }
}
