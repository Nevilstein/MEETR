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
import { UserGeoPage } from '../pages/user/user-geo/user-geo';
import { UserGeoPageModule } from '../pages/user/user-geo/user-geo.module';
import { UserFormPage } from '../pages/user/user-form/user-form';
import { UserFormPageModule } from '../pages/user/user-form/user-form.module';
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
import { UserMatchPage } from '../pages/user/user-match/user-match';
import { UserMatchPageModule } from '../pages/user/user-match/user-match.module';
import { UserInterestPage } from '../pages/user/user-interest/user-interest';
import { UserInterestPageModule } from '../pages/user/user-interest/user-interest.module';
import { ImageViewPage } from '../pages/image-view/image-view';
import { ImageViewPageModule } from '../pages/image-view/image-view.module';
import { PopoverComponent } from '../components/popover/popover';

//Plugins
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuth, AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { SwipeCardsModule } from 'ng2-swipe-cards';
import { Facebook } from '@ionic-native/facebook';
import { Camera } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import firebase from 'firebase';
import { LocalNotifications } from '@ionic-native/local-notifications';

//Provider
import { AuthProvider } from '../providers/auth/auth';
import { ChatProvider } from '../providers/chat/chat';
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
    MyApp,
    PopoverComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp,{tabsPlacement: 'top'}),
    HttpClientModule,
    SwipeCardsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
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
    UserGeoPageModule,
    UserFormPageModule,
    UserChatroomPageModule,
    UserMatchPageModule,
    UserInterestPageModule,
    ImageViewPageModule
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
    UserCheckPage,
    UserFormPage,
    UserGeoPage,
    UserMatchPage,
    PopoverComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Facebook,
    Geolocation,
    AngularFireAuth,
    Camera,
    LocalNotifications,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    ChatProvider,
    UserProvider
  ]
})
export class AppModule {}
