import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { Facebook } from '@ionic-native/facebook';
import * as firebase from 'firebase/app';

import { MyApp } from './app.component';

import { LoginPage } from '../pages/login/login';
import { AdminHomePage } from '../pages/admin/admin-home/admin-home';
import { AdminListPage } from '../pages/admin/admin-list/admin-list';
import { AdminSettingPage } from '../pages/admin/admin-setting/admin-setting';
import { AdminTabsPage } from '../pages/admin/admin-tabs/admin-tabs';
import { UserEditPage } from '../pages/user/user-edit/user-edit';
import { UserHomePage } from '../pages/user/user-home/user-home';
import { UserProfilePage } from '../pages/user/user-profile/user-profile';
import { UserSettingPage } from '../pages/user/user-setting/user-setting';

// import { LoginPageModule } from '../pages/login/login.module';
// import { UserProfilePageModule } from '../pages/user/user-profile/user-profile.module';
// import { UserEditPageModule } from '../pages/user/user-edit/user-edit.module';
// import { UserSettingPageModule } from '../pages/user/user-setting/user-setting.module';
// import { UserSettingPage } from '../pages/user/user-setting/user-setting';
// import { UserEditPage } from '../pages/user/user-edit/user-edit';
// import { UserHomePageModule } from '../pages/user/user-home/user-home.module';
// import { AdminTabsPageModule} from '../pages/admin/admin-tabs/admin-tabs.module';
// import { AdminTabsPage} from '../pages/admin/admin-tabs/admin-tabs';
// import { AdminHomePage} from '../pages/admin/admin-home/admin-home';
// import { AdminHomePageModule} from '../pages/admin/admin-home/admin-home.module';
// import { AdminListPage} from '../pages/admin/admin-list/admin-list';
// import { AdminListPageModule} from '../pages/admin/admin-list/admin-list.module';
// import { AdminSettingPage} from '../pages/admin/admin-setting/admin-setting';
// import { AdminSettingPageModule} from '../pages/admin/admin-setting/admin-setting.module';

var firebaseConfig = {
    apiKey: "AIzaSyCjTUixYv189FGdP3hQdztU_HCbtqvjJTU",
    authDomain: "meetr-e4a7c.firebaseapp.com",
    databaseURL: "https://meetr-e4a7c.firebaseio.com",
    projectId: "meetr-e4a7c",
    storageBucket: "meetr-e4a7c.appspot.com",
    messagingSenderId: "400578335773"
  };
  firebase.initializeApp(firebaseConfig);

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    AdminHomePage,
    AdminListPage,
    AdminSettingPage,
    AdminTabsPage,
    UserEditPage,
    UserHomePage,
    UserProfilePage,
    UserSettingPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    // LoginPageModule,
    // UserProfilePageModule,
    // UserEditPageModule,
    // UserSettingPageModule,
    // AdminTabsPageModule,
    // AdminHomePageModule,
    // AdminListPageModule,
    // AdminSettingPageModule,
    // UserHomePageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    AdminHomePage,
    AdminListPage,
    AdminSettingPage,
    AdminTabsPage,
    UserEditPage,
    UserHomePage,
    UserProfilePage,
    UserSettingPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Facebook
  ]
})
export class AppModule {}
