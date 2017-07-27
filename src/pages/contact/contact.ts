import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

const bannerConfig: AdMobFreeBannerConfig = {
  id: 'ca-app-pub-2445138966914411/2912933957',
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
    this.admobFree.banner.prepare()
      .then(() => {
      })
      .catch(e => console.log(e));

    this.ga.startTrackerWithId('UA-103091347-1')
      .then(() => {
        this.ga.trackView('ContactPage');
      })
      .catch(e => console.log('Error starting GoogleAnalytics', e));

  }
  shareApp() {
    this.socialSharing.share('Download this app from https://goo.gl/z8QFA2', 'My Engineering - TNEA - Android App', '', 'https://play.google.com/store/apps/details?id=org.saravanakumar.myengineeringtnea').then(() => {
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
