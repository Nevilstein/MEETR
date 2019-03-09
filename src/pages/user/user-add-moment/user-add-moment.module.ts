import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserAddMomentPage } from './user-add-moment';

@NgModule({
  declarations: [
    UserAddMomentPage,
  ],
  imports: [
    IonicPageModule.forChild(UserAddMomentPage),
  ],
})
export class UserAddMomentPageModule {}
