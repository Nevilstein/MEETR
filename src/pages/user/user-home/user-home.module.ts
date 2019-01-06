import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserHomePage } from './user-home';
import { SwipeCardsModule } from 'ng2-swipe-cards';

@NgModule({
  declarations: [
    UserHomePage,
  ],
  imports: [
  	SwipeCardsModule,
    IonicPageModule.forChild(UserHomePage),
  ],
})
export class UserHomePageModule {}
