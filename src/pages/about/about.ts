import { Component } from '@angular/core';
import { NavController, ModalController, AlertController } from 'ionic-angular';
import { clean } from 'clean-html';
import { to_json } from 'xmljson';
import $ from 'jquery';

import { SocialSharing } from '@ionic-native/social-sharing';
import { Storage } from '@ionic/storage';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { AppService } from '../../app/app.service';
import { AddBranchModal } from './addBranchModal';

import * as moment from "moment";
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
const bannerConfig: AdMobFreeBannerConfig = {
  id: 'ca-app-pub-2445138966914411/2912933957',
  autoShow: true
};

const options = {
  'add-remove-attributes': ['style', 'colspan', 'id'],
  'add-remove-tags': ['b', 'a', 'h1'],
  'remove-empty-tags': ['tr'],
  'replace-nbsp': true,
  'remove-comments': true,
  'wrap': 0
};

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  private branchesList: Array<any> = [];
  private currentFetchCode: string;
  private isMainLoading: boolean = false;


  constructor(public navCtrl: NavController,
    private appService: AppService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private storage: Storage,
    private socialSharing: SocialSharing,
    private admobFree: AdMobFree,
    private ga: GoogleAnalytics) {

    // this.loading = this.loadingCtrl.create({
    //     content: 'Please wait...'
    // })
    this.isMainLoading = true;
    this.getStore();

    this.ga.startTrackerWithId('UA-103091347-1')
      .then(() => {
        this.ga.trackView('BranchesPage');
      })
      .catch(e => console.log('Error starting GoogleAnalytics', e));


    this.admobFree.banner.config(bannerConfig);
    this.admobFree.banner.prepare()
      .then(() => {
      })
      .catch(e => console.log(e));


    // this.getDetailedPage();
  }
  getStore() {
    this.storage.get('bListStore').then((val) => {
      // console.log(val);
      // console.log(typeof val);
      // console.log(typeof JSON.parse(val));
      if (val) {
        this.branchesList = JSON.parse(val);
      }
      this.isMainLoading = false;
    });
  }
  refreshCollege(currentFetchCodeParam) {
    this.getDetailedPage(currentFetchCodeParam);
  }

  getDetailedPage(currentFetchCodeParam): void {

    this.currentFetchCode = currentFetchCodeParam;
    var requestObj = {
      requestbcode: currentFetchCodeParam,
      isLoading: true
    }
    console.log(this.branchesList);
    // let branchesListLength = this.branchesList.length;
    let isExisting: boolean = false;
    this.branchesList = [];
    this.branchesList.push(requestObj);
    // for (let i = 0; i < branchesListLength; i++) {
    //     if (this.branchesList[i].bcode === currentFetchCodeParam) {
    //         this.branchesList[i] = requestObj;
    //         isExisting = true;
    //         break;
    //     }
    // }
    // if (!isExisting) {
    //     this.branchesList.push(requestObj);
    // }
    // this.loading.present();
    this.appService
      .getDetailedPage(currentFetchCodeParam, 'bname')
      .then(data => {
        var dataHtml = $.parseHTML(data);
        var branchesObj = $(dataHtml).find("table")[2];
        if (branchesObj) {
          console.log(branchesObj.outerHTML);
          let branchString = branchesObj.outerHTML;
          // branchString = branchString.replace(new RegExp('<td class="com"></td>', 'g'), '<td class="com">0</td>');
          clean(branchString, options, (html) => {
            html = html.replace(new RegExp('<td></td>', 'g'), '');
            html = html.replace(new RegExp('<br>', 'g'), ',');
            html = html.replace(new RegExp('<td class="com"></td>', 'g'), '<td>0</td>');
            html = html.replace(new RegExp(' class="com"', 'g'), '');
            html = html.replace(/^\s+|\s+$|\s+(?=\s)/g, "")
            // console.log(html);
            to_json(html, (error, result) => {
              // Module returns a JS object 
              console.log(error);
              // console.log(result);
              var resultObj = {};
              var branchesArray = [];
              if (result) {
                // console.log(result.table.tbody.tr);
                let obj = result.table.tbody.tr;
                let objLength = Object.keys(obj).length;
                let count = 0;
                let currentbname = '';
                for (var prop in obj) {
                  // console.log(`obj.${prop} = ${obj[prop]}`);
                  // console.log(obj[prop]);
                  if (prop === '0') {
                    currentbname = obj[prop].td;;
                    resultObj['bname'] = currentbname;
                  }
                  else if (prop === '1') {
                    //category empty
                  }
                  else {
                    // resultObj[`${'branch'}_prop`] = obj[prop].td;
                    branchesArray.push(obj[prop].td);
                  }
                  count++;
                  // console.log(count)
                  // console.log(objLength)
                  if (count >= objLength) {
                    // console.log('last');
                    resultObj['colleges'] = branchesArray;
                    resultObj['isLoading'] = false;
                    resultObj['updatedAt'] = moment().format();

                    this.ga.startTrackerWithId('UA-103091347-1')
                      .then(() => {
                        this.ga.trackView('BranchesPage:Add:' + currentbname);
                      })
                      .catch(e => console.log('Error starting GoogleAnalytics', e));

                    let branchesListLength = this.branchesList.length;
                    for (let i = 0; i < branchesListLength; i++) {
                      if (this.branchesList[i].requestbcode === this.currentFetchCode) {
                        this.branchesList[i] = resultObj;
                        this.saveStore();
                        break;
                      }
                    }

                    // this.branchesList.push(resultObj);
                    // console.log(this.branchesList)
                  }
                }
              }
              // console.log(JSON.stringify(result));
            });
          });
        }
        // this.loading.dismiss();
      });
  }

  saveStore() {
    console.log(this.branchesList);
    this.storage.remove('bListStore');
    this.storage.set('bListStore', JSON.stringify(this.branchesList));
  }

  selectBranch() {
    let branchModal = this.modalCtrl.create(AddBranchModal);
    branchModal.onDidDismiss(data => {
      console.log(data);
      if (data) {
        this.getDetailedPage(data.bcode);
      }
    });
    branchModal.present();
  }
  getTimeAgo(dateTime) {
    console.log(dateTime)
    return moment(dateTime).fromNow();
  }

  getCCode(nameAndCode) {
    return nameAndCode.substr(0, nameAndCode.indexOf('-'));
  }
  getCName(nameAndCode) {
    return nameAndCode.substr(nameAndCode.indexOf('-') + 1);
  }
}

