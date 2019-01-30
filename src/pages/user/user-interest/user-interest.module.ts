import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserInterestPage } from './user-interest';

@NgModule({
  declarations: [
    UserInterestPage,
  ],
  imports: [
    IonicPageModule.forChild(UserInterestPage),
  ],
})
export class UserInterestPageModule {}
