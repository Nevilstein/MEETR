import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserGeoPage } from './user-geo';
import { SwipeCardsModule } from 'ng2-swipe-cards';


@NgModule({
  declarations: [
    UserGeoPage,
  ],
  imports: [
  	SwipeCardsModule,
    IonicPageModule.forChild(UserGeoPage),
  ],
})
export class UserGeoPageModule {}
