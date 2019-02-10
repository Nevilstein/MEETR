import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserChatTutorialPage } from './user-chat-tutorial';

@NgModule({
  declarations: [
    UserChatTutorialPage,
  ],
  imports: [
    IonicPageModule.forChild(UserChatTutorialPage),
  ],
})
export class UserChatTutorialPageModule {}
