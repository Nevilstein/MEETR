import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserTutorialPage } from './user-tutorial';

@NgModule({
  declarations: [
    UserTutorialPage,
  ],
  imports: [
    IonicPageModule.forChild(UserTutorialPage),
  ],
})
export class UserTutorialPageModule {}
