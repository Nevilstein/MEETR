import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserDrawPage } from './user-draw';

@NgModule({
  declarations: [
    UserDrawPage,
  ],
  imports: [
    IonicPageModule.forChild(UserDrawPage),
  ],
})
export class UserDrawPageModule {}
