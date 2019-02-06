import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
//import { AdminTabsPage } from '../pages/admin/admin-tabs/admin-tabs';
// import {UserHomePage} from '../pages/user/user-home/user-home';
import { UserProfilePage } from '../pages/user/user-profile/user-profile';
import { timer } from 'rxjs/observable/timer';

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any=LoginPage;
  showSplash = true;
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private fb: Facebook) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // statusBar.styleDefault();
      // splashScreen.hide();
      statusBar.styleLightContent();
      splashScreen.hide();
      timer(4000).subscribe(() => this.showSplash = false)
    });
  }
}

