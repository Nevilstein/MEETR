import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserAskPage } from './user-ask';

@NgModule({
  declarations: [
    UserAskPage,
  ],
  imports: [
    IonicPageModule.forChild(UserAskPage),
  ],
})
export class UserAskPageModule {}
