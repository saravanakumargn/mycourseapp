import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

const bannerConfig: AdMobFreeBannerConfig = {
  // add your config here
  // for the sake of this example we will just use the test config
  isTesting: true,
  autoShow: true
};

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(public navCtrl: NavController,
  private socialSharing: SocialSharing,
private admobFree: AdMobFree,
private ga: GoogleAnalytics) {

    this.admobFree.banner.config(bannerConfig);

    this.ga.startTrackerWithId('UA-103091347-1')
      .then(() => {
        this.ga.trackView('ContactPage');
      })
      .catch(e => console.log('Error starting GoogleAnalytics', e));

  }
  shareApp() {
    this.socialSharing.share('Body', 'Subject', '', 'http://www.saravanakumar.org').then(() => {
      // Success!
      this.ga.startTrackerWithId('UA-103091347-1')
        .then(() => {
          this.ga.trackView('ContactPage:shareApp');
        })
        .catch(e => console.log('Error starting GoogleAnalytics', e));

    }).catch(() => {
      // Error!
    });
  }
}
