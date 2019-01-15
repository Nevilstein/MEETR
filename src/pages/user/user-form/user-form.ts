import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';

/**
 * Generated class for the UserFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-form',	
  templateUrl: 'user-form.html',
})
export class UserFormPage {
	@ViewChild(Slides) slides: Slides;
	toggle_male: boolean = true;
	toggle_female: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserFormPage');
    this.slides.lockSwipes(true);
  }
  toggleOne() {
  	this.toggle_male = !this.toggle_female;
  }
  toggleTwo() {
  	this.toggle_female = !this.toggle_male;
  }
  gotoNext(){
  	this.slides.lockSwipes(false);
  	this.slides.slideNext();
  	this.slides.lockSwipes(true);
  }
  goPrev(){
  	this.slides.lockSwipes(false);
  	this.slides.slidePrev();
  	this.slides.lockSwipes(true);
  }
}
