import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { Storage } from '@ionic/storage';

const bannerConfig: AdMobFreeBannerConfig = {
  // add your config here
  // for the sake of this example we will just use the test config
  isTesting: true,
  autoShow: true
};

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  community: string;
  constructor(public navCtrl: NavController,
    private socialSharing: SocialSharing,
    private admobFree: AdMobFree,
    private storage: Storage,
    private ga: GoogleAnalytics) {
      this.community = "";
      this.getStore();

    this.admobFree.banner.config(bannerConfig);

    this.ga.startTrackerWithId('UA-103091347-1')
      .then(() => {
        this.ga.trackView('ContactPage');
      })
      .catch(e => console.log('Error starting GoogleAnalytics', e));
  }


    getStore() {
        this.storage.get('uc').then((val) => {
            // console.log(val);
            // console.log(typeof val);
            // console.log(typeof JSON.parse(val));
            if (val) {
                this.community = val;
                // console.log(this.community)
            }
        });
    }

  changed() {
this.storage.set('uc', this.community);
  }

  shareApp() {
    this.socialSharing.share('Body', 'Subject', '', 'http://www.saravanakumar.org').then(() => {
      // Success!
      this.ga.startTrackerWithId('UA-103091347-1')
        .then(() => {
          this.ga.trackView('SettingsPage:shareApp');
        })
        .catch(e => console.log('Error starting GoogleAnalytics', e));

    }).catch(() => {
      // Error!
    });
  }
}
