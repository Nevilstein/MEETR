import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserChatPage } from './user-chat';

@NgModule({
  declarations: [
    UserChatPage,
  ],
  imports: [
    IonicPageModule.forChild(UserChatPage),
  ],
})
export class UserChatPageModule {}
