import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserFormPage } from './user-form';

@NgModule({
  declarations: [
    UserFormPage,
  ],
  imports: [
    IonicPageModule.forChild(UserFormPage),
  ],
})
export class UserFormPageModule {}
