import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserMeetupPage } from './user-meetup';

@NgModule({
  declarations: [
    UserMeetupPage,
  ],
  imports: [
    IonicPageModule.forChild(UserMeetupPage),
  ],
})
export class UserMeetupPageModule {}
