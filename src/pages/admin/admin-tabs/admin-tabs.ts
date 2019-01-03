import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AdminHomePage} from "../admin-home/admin-home";
import {AdminListPage} from "../admin-list/admin-list";
import {AdminSettingPage} from "../admin-setting/admin-setting";

/**
 * Generated class for the AdminTabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-admin-tabs',
  templateUrl: 'admin-tabs.html',
})
export class AdminTabsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
  tab1root=AdminHomePage;
  tab2root=AdminListPage;
  tab3root=AdminSettingPage;
}
