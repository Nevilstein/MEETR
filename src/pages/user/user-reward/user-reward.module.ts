import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserRewardPage } from './user-reward';

@NgModule({
  declarations: [
    UserRewardPage,
  ],
  imports: [
    IonicPageModule.forChild(UserRewardPage),
  ],
})
export class UserRewardPageModule {}
