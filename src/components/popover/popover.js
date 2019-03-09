var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
//Pages
import { UserGeoPage } from '../../pages/user/user-geo/user-geo';
import { UserReportPage } from '../../pages/user/user-report/user-report';
//Plugin
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
//Providers
import { AuthProvider } from '../../providers/auth/auth';
import { ChatProvider } from '../../providers/chat/chat';
/**
 * Generated class for the PopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
var PopoverComponent = /** @class */ (function () {
    function PopoverComponent(navCtrl, navParams, authProvider, db, chatProvider, view, modalCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.authProvider = authProvider;
        this.db = db;
        this.chatProvider = chatProvider;
        this.view = view;
        this.modalCtrl = modalCtrl;
        this.authKey = this.authProvider.authUser;
        this.chatKey = this.chatProvider.chatKey;
        this.receiverKey = this.chatProvider.receiverKey;
    }
    PopoverComponent.prototype.gotoGeo = function () {
        this.navCtrl.push(UserGeoPage);
    };
    PopoverComponent.prototype.unmatch = function () {
        var _this = this;
        this.db.list('chat', function (ref) { return ref.child(_this.authKey); }).update(this.chatKey, {
            matchStatus: false
        });
        this.db.list('chat', function (ref) { return ref.child(_this.receiverKey); }).update(this.chatKey, {
            matchStatus: false
        });
        this.db.list('match', function (ref) { return ref.child(_this.authKey); }).remove(this.receiverKey);
        this.db.list('match', function (ref) { return ref.child(_this.receiverKey); }).remove(this.authKey);
        this.view.dismiss();
    };
    PopoverComponent.prototype.clearChat = function () {
        var _this = this;
        this.db.list('messages', function (ref) { return ref.child(_this.authKey).child(_this.chatKey); })
            .query.once('value').then(function (snapshot) {
            snapshot.forEach(function (element) {
                _this.db.list('messages', function (ref) { return ref.child(_this.authKey).child(_this.chatKey); }).update(element.key, {
                    status: false
                });
            });
            _this.db.list('chat', function (ref) { return ref.child(_this.authKey); }).update(_this.chatKey, {
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        });
        this.view.dismiss();
    };
    PopoverComponent.prototype.reportUser = function () {
        var modal = this.modalCtrl.create(UserReportPage, { user: this.receiverKey });
        modal.present();
    };
    PopoverComponent = __decorate([
        Component({
            selector: 'popover',
            templateUrl: 'popover.html'
        }),
        __metadata("design:paramtypes", [NavController, NavParams, AuthProvider,
            AngularFireDatabase, ChatProvider, ViewController,
            ModalController])
    ], PopoverComponent);
    return PopoverComponent;
}());
export { PopoverComponent };
//# sourceMappingURL=popover.js.map