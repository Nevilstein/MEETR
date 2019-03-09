import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserViewMomentPage } from './user-view-moment';

@NgModule({
  declarations: [
    UserViewMomentPage,
  ],
  imports: [
    IonicPageModule.forChild(UserViewMomentPage),
  ],
})
export class UserViewMomentPageModule {}
