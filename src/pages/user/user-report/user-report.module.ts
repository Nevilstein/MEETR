import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserReportPage } from './user-report';

@NgModule({
  declarations: [
    UserReportPage,
  ],
  imports: [
    IonicPageModule.forChild(UserReportPage),
  ],
})
export class UserReportPageModule {}
