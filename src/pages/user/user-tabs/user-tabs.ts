import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Tabs } from 'ionic-angular';

//Pages
import { LoginPage } from '../../login/login';
import { UserProfilePage } from '../user-profile/user-profile';
import { UserHomePage } from '../user-home/user-home';
import { UserChatPage } from '../user-chat/user-chat';

//Plugins
import { AngularFireAuth } from 'angularfire2/auth';
import { Facebook } from '@ionic-native/facebook';
import { Geolocation } from '@ionic-native/geolocation';


//Providers
import { UserProvider } from '../../../providers/user/user';
/**
 * Generated class for the UserTabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-tabs',
  templateUrl: 'user-tabs.html',
})
export class UserTabsPage {
  constructor(public navCtrl: NavController, public navParams: NavParams, private userProvider: UserProvider, private appCtrl: App,
    private fireAuth: AngularFireAuth, private fb: Facebook, private zone: NgZone, private geolocation: Geolocation ) {
  }

  @ViewChild('userTab') tabRef: Tabs;
  user_tab1root = UserProfilePage;
  user_tab2root = UserHomePage;
  user_tab3root = UserChatPage;

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserTabsPage');
    
    //Load all first to start data (for async purposes)
    // this.tabRef.getAllChildNavs().forEach( nav =>{
    //   this.tabRef.select(nav.index);
    // });

    // this.geolocation.getCurrentPosition().then(pos => {
    //   console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
    // });
    // this.geolocation.watchPosition().subscribe(pos => {
    //   console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
    // });

    this.fireAuth.authState.subscribe( fireRes =>{    //Checking if no problems in authentication
      this.fb.getLoginStatus().then(fbRes =>{
        if(!fireRes && fbRes.status !== 'connected'){
          this.zone.run(() => {
              this.appCtrl.getRootNav().setRoot(LoginPage);
          });
        }
      });
    });
    
    

    // this.tabRef.select(0).then(() =>{
    //   this.
    // })
    
    // this.tabRef.ionChange.subscribe(res =>{
    //   console.log(res.index);
    // });
    
  }

}
