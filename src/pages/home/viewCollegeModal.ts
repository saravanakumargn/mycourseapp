import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController } from 'ionic-angular';

import * as moment from "moment";
import * as path from '../../app/constants/paths';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
const bannerConfig: AdMobFreeBannerConfig = {
  id: 'ca-app-pub-2445138966914411/1933882441',
  autoShow: true
};

@Component({
    templateUrl: 'viewCollege-template.html'
})
export class ViewCollegeModal {
      
  
private viewItem:any;
    constructor(
        public viewCtrl: ViewController,
        params: NavParams,
        public alertCtrl: AlertController,
        private admobFree: AdMobFree
    ) {
        this.viewItem = params.get('viewItem');
        // console.log(this.viewItem);

            this.admobFree.banner.config(bannerConfig);
    this.admobFree.banner.prepare()
      .then(() => {
      })
      .catch(e => console.log(e));
    }

    deleteView(deleteItem) {

            let confirm = this.alertCtrl.create({
      title: 'Delete',
      message: 'Remove view?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          handler: () => {
            this.viewCtrl.dismiss(deleteItem);
          }
        }
      ]
    });
    confirm.present();

    }
  
  getTimeAgo(dateTime) {
    // console.log(dateTime)
    return moment(dateTime).fromNow();
  }

    dismiss() {
        this.viewCtrl.dismiss(null);
    }
}