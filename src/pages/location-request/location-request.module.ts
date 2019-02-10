import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocationRequestPage } from './location-request';

@NgModule({
  declarations: [
    LocationRequestPage,
  ],
  imports: [
    IonicPageModule.forChild(LocationRequestPage),
  ],
})
export class LocationRequestPageModule {}
