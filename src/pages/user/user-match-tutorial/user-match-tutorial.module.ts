import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserMatchTutorialPage } from './user-match-tutorial';

@NgModule({
  declarations: [
    UserMatchTutorialPage,
  ],
  imports: [
    IonicPageModule.forChild(UserMatchTutorialPage),
  ],
})
export class UserMatchTutorialPageModule {}
