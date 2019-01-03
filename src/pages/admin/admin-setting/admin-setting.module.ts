import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdminSettingPage } from './admin-setting';

@NgModule({
  declarations: [
    AdminSettingPage,
  ],
  imports: [
    IonicPageModule.forChild(AdminSettingPage),
  ],
})
export class AdminSettingPageModule {}
