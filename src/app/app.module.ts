import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule } from '@angular/common/http'; 

import { MyApp } from './app.component';

//Pages
import { LoginPageModule } from '../pages/login/login.module';
import { UserProfilePageModule } from '../pages/user/user-profile/user-profile.module';
import { UserEditPageModule } from '../pages/user/user-edit/user-edit.module';
import { UserSettingPageModule } from '../pages/user/user-setting/user-setting.module';
import { UserSettingPage } from '../pages/user/user-setting/user-setting';
import { UserEditPage } from '../pages/user/user-edit/user-edit';
import { UserChatPage } from '../pages/user/user-chat/user-chat';
import { UserChatPageModule } from '../pages/user/user-chat/user-chat.module';
import { UserHomePage } from '../pages/user/user-home/user-home';
import { UserHomePageModule } from '../pages/user/user-home/user-home.module';
import { UserTabsPage } from '../pages/user/user-tabs/user-tabs';
import { UserTabsPageModule } from '../pages/user/user-tabs/user-tabs.module';
import { UserReportPage } from '../pages/user/user-report/user-report';
import { UserReportPageModule } from '../pages/user/user-report/user-report.module';
import { UserCheckPage } from '../pages/user/user-check/user-check';
import { UserCheckPageModule } from '../pages/user/user-check/user-check.module';
import { AdminTabsPageModule} from '../pages/admin/admin-tabs/admin-tabs.module';
import { AdminTabsPage} from '../pages/admin/admin-tabs/admin-tabs';
import { AdminHomePage} from '../pages/admin/admin-home/admin-home';
import { AdminHomePageModule} from '../pages/admin/admin-home/admin-home.module';
import { AdminListPage} from '../pages/admin/admin-list/admin-list';
import { AdminListPageModule} from '../pages/admin/admin-list/admin-list.module';
import { AdminSettingPage} from '../pages/admin/admin-setting/admin-setting';
import { AdminSettingPageModule} from '../pages/admin/admin-setting/admin-setting.module';
import { UserChatroomPage } from '../pages/user/user-chatroom/user-chatroom';	
import { UserChatroomPageModule } from '../pages/user/user-chatroom/user-chatroom.module';

//Plugins
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireAuth } from 'angularfire2/auth';
import { SwipeCardsModule } from 'ng2-swipe-cards';
import { Facebook } from '@ionic-native/facebook';

import firebase from 'firebase';

//Provider
import { UserProvider } from '../providers/user/user';  

export const firebaseConfig = {
    apiKey: "AIzaSyCjTUixYv189FGdP3hQdztU_HCbtqvjJTU",
    authDomain: "meetr-e4a7c.firebaseapp.com",
    databaseURL: "https://meetr-e4a7c.firebaseio.com",
    projectId: "meetr-e4a7c",
    storageBucket: "meetr-e4a7c.appspot.com",
    messagingSenderId: "400578335773"
  };
// firebase.initializeApp(firebaseConfig)

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp,{tabsPlacement: 'top'}),
    HttpClientModule,
    SwipeCardsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    LoginPageModule,
    UserProfilePageModule,
    UserEditPageModule,
    UserSettingPageModule,
    AdminTabsPageModule,
    AdminHomePageModule,
    AdminListPageModule,
    AdminSettingPageModule,
    UserTabsPageModule,
    UserHomePageModule,
    UserChatPageModule,
    UserReportPageModule,
    UserCheckPageModule,
	UserChatroomPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    UserEditPage,
    UserSettingPage,
    AdminTabsPage,
    AdminHomePage,
    AdminListPage,
    AdminSettingPage,
    UserTabsPage,
    UserHomePage,
    UserChatPage,
    UserReportPage,
    UserCheckPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Facebook,
    AngularFireAuth,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserProvider
  ]
})
export class AppModule {}
