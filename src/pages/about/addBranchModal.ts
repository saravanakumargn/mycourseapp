import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { AppService } from '../../app/app.service';
import * as path from '../../app/constants/paths';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
const bannerConfig: AdMobFreeBannerConfig = {
  id: 'ca-app-pub-2445138966914411/2912933957',
  autoShow: true
};
@Component({
  templateUrl: 'addBranch-template.html'
})
export class AddBranchModal {
  searchQuery: string = '';
  items: Array<any> = [];
  private branches: Array<any> = [];


  constructor(
    public viewCtrl: ViewController,
    private appService: AppService,
    private admobFree: AdMobFree,
  ) {
    // console.log(this.items);
    this.getData();
    this.admobFree.banner.config(bannerConfig);
    this.admobFree.banner.prepare()
      .then(() => {
      })
      .catch(e => console.log(e));
  }

  getData() {
    this.appService
      .getLocalDataService(path.brancheDataPath)
      .then(data => {
        // console.log(typeof data);
        // console.log(data);   
        this.branches = data.branches;
        this.initializeItems();

        // this.items = data.colleges;
        // console.log(this.items);
      });
  }

  initializeItems() {
    this.items = this.branches;

  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return (item.bname.toLowerCase().indexOf(val.toLowerCase()) > -1 || item.bcode.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  itemSelected(item: any) {
    //   console.log(item)
    this.viewCtrl.dismiss(item);
  }

  dismiss() {
    this.viewCtrl.dismiss(null);
  }
}