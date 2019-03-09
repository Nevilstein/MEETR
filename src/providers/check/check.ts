import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the CheckProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CheckProvider {
	profile;
	active;
	answers = [];
	moments = [];
	myLocation;
	userLocation;
	currentMoment;  //currently viewed moment
	isMatched = false;
  constructor(public http: HttpClient) {
    console.log('Hello CheckProvider Provider');
  }

}
