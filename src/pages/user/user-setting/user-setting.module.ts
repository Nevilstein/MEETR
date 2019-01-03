import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserSettingPage } from './user-setting';

@NgModule({
  declarations: [
    UserSettingPage,
  ],
  imports: [
    IonicPageModule.forChild(UserSettingPage),
  ],
})
export class UserSettingPageModule {}
