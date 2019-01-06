import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserTabsPage } from './user-tabs';

@NgModule({
  declarations: [
    UserTabsPage,
  ],
  imports: [
    IonicPageModule.forChild(UserTabsPage),
  ],
})
export class UserTabsPageModule {}
