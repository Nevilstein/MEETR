import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdminListPage } from './admin-list';

@NgModule({
  declarations: [
    AdminListPage,
  ],
  imports: [
    IonicPageModule.forChild(AdminListPage),
  ],
})
export class AdminListPageModule {}
