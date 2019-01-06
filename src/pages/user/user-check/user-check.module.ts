import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserCheckPage } from './user-check';

@NgModule({
  declarations: [
    UserCheckPage,
  ],
  imports: [
    IonicPageModule.forChild(UserCheckPage),
  ],
})
export class UserCheckPageModule {}
