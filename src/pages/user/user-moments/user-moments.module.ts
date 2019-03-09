import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserMomentsPage } from './user-moments';

@NgModule({
  declarations: [
    UserMomentsPage,
  ],
  imports: [
    IonicPageModule.forChild(UserMomentsPage),
  ],
})
export class UserMomentsPageModule {}
