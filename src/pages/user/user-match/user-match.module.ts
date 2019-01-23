import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserMatchPage } from './user-match';

@NgModule({
  declarations: [
    UserMatchPage,
  ],
  imports: [
    IonicPageModule.forChild(UserMatchPage),
  ],
})
export class UserMatchPageModule {}
