import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserChatroomPage } from './user-chatroom';

@NgModule({
  declarations: [
    UserChatroomPage,
  ],
  imports: [
    IonicPageModule.forChild(UserChatroomPage),
  ],
})
export class UserChatroomPageModule {}
