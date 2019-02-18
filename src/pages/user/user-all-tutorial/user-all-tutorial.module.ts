import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserAllTutorialPage } from './user-all-tutorial';

@NgModule({
  declarations: [
    UserAllTutorialPage,
  ],
  imports: [
    IonicPageModule.forChild(UserAllTutorialPage),
  ],
})
export class UserAllTutorialPageModule {}
