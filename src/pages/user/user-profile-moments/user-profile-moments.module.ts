import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserProfileMomentsPage } from './user-profile-moments';

@NgModule({
  declarations: [
    UserProfileMomentsPage,
  ],
  imports: [
    IonicPageModule.forChild(UserProfileMomentsPage),
  ],
})
export class UserProfileMomentsPageModule {}
