import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {UserGeoPage} from '../../pages/user/user-geo/user-geo';
/**
 * Generated class for the PopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent {

  text: string;

  constructor(public navCtrl: NavController) {
  }
  gotoGeo(){
    this.navCtrl.push(UserGeoPage);
  }

}
