import { Component } from '@angular/core';
import { NavController, ModalController, AlertController } from 'ionic-angular';
// import { LoadingController } from 'ionic-angular';
import { clean } from 'clean-html';
import { to_json } from 'xmljson';
import $ from 'jquery';

import { SocialSharing } from '@ionic-native/social-sharing';
import { Storage } from '@ionic/storage';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';

import { AppService } from '../../app/app.service';
import { AddCollegeModal } from './addCollegeModal';
import { ViewCollegeModal } from './viewCollegeModal';

import * as moment from "moment";

const bannerConfig: AdMobFreeBannerConfig = {
  id: 'ca-app-pub-2445138966914411/1031864311',
  autoShow: true
};

const options = {
  'add-remove-attributes': ['style', 'colspan', 'id'],
  'add-remove-tags': ['b', 'a'],
  'remove-empty-tags': ['tr'],
  'replace-nbsp': true,
  'remove-comments': true,
  'wrap': 0
};

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  // loading: any;
  private collegesList: Array<any> = [];
  private currentFetchCode: number = 0;
  private isMainLoading: boolean = false;

  constructor(public navCtrl: NavController,
    private appService: AppService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private storage: Storage,
    private socialSharing: SocialSharing,
    private ga: GoogleAnalytics,
    private admobFree: AdMobFree) {

    // this.loading = this.loadingCtrl.create({
    //     content: 'Please wait...'
    // })
    this.isMainLoading = true;
    this.getStore();

    this.ga.startTrackerWithId('UA-103091347-1')
      .then(() => {
        this.ga.trackView('HomePage');
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
    this.storage.get('cListStore').then((val) => {
      // console.log(val);
      // console.log(typeof val);
      // console.log(typeof JSON.parse(val));
      if (val) {
        this.collegesList = JSON.parse(val);
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
      requestccode: currentFetchCodeParam,
      isLoading: true
    }
    console.log(this.collegesList);
    let collegesListLength = this.collegesList.length;
    let isExisting: boolean = false;
    for (let i = 0; i < collegesListLength; i++) {
      if (this.collegesList[i].ccode === currentFetchCodeParam) {
        this.collegesList[i] = requestObj;
        isExisting = true;
        break;
      }
    }
    if (!isExisting) {
      this.collegesList.push(requestObj);
    }
    // this.loading.present();
    this.appService
      .getDetailedPage(currentFetchCodeParam, 'ccode')
      .then(data => {
        var dataHtml = $.parseHTML(data);
        var branchesObj = $(dataHtml).find("table")[2];
        if (branchesObj) {
          // console.log(branchesObj.outerHTML);
          let branchString = branchesObj.outerHTML;
          // branchString = branchString.replace(new RegExp('<td class="com"></td>', 'g'), '<td class="com">0</td>');
          clean(branchString, options, (html) => {
            html = html.replace(new RegExp('<td></td>', 'g'), '');
            html = html.replace(new RegExp('<br>', 'g'), ',');
            html = html.replace(new RegExp('<td class="com"></td>', 'g'), '<td>0</td>');
            html = html.replace(new RegExp(' class="com"', 'g'), '');
            html = html.replace(/^\s+|\s+$|\s+(?=\s)/g, "")
            console.log(html);
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
                let currentCcode = 0;
                let currentCname = '';
                for (var prop in obj) {
                  // console.log(`obj.${prop} = ${obj[prop]}`);
                  // console.log(obj[prop]);
                  if (prop === '0') {
                    // console.log(obj[prop].td);
                    let nameAndCode = obj[prop].td;
                    // console.log(nameAndCode)
                    currentCcode = nameAndCode.substr(0, nameAndCode.indexOf('-'));
                    currentCname = nameAndCode.substr(nameAndCode.indexOf('-') + 1);
                    resultObj['ccode'] = currentCcode;
                    resultObj['cname'] = currentCname;
                  }
                  else if (prop === '1') {
                    // let address = obj[prop].td;
                    resultObj['address'] = obj[prop].td.trim();
                  }
                  else if (prop === '2') {
                    // let address = obj[prop].td;
                    resultObj['category'] = obj[prop].td;
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
                    resultObj['branches'] = branchesArray;
                    resultObj['isLoading'] = false;
                    resultObj['updatedAt'] = moment().format();

                    this.ga.startTrackerWithId('UA-103091347-1')
                      .then(() => {
                        this.ga.trackView('HomePage:Add:' + currentCname);
                      })
                      .catch(e => console.log('Error starting GoogleAnalytics', e));

                    let collegesListLength = this.collegesList.length;
                    for (let i = 0; i < collegesListLength; i++) {
                      if (this.collegesList[i].requestccode === currentCcode) {
                        this.collegesList[i] = resultObj;
                        this.saveStore();
                        break;
                      }
                    }

                    // this.collegesList.push(resultObj);
                    // console.log(this.collegesList)
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
    console.log(this.collegesList);
    this.storage.remove('cListStore');
    this.storage.set('cListStore', JSON.stringify(this.collegesList));
  }

  // getLoginPage(): void {
  //     this.appService
  //         .getWebpage()
  //         .then(data => {
  //             var dataHtml = $.parseHTML(data);
  //             var _vacancyPositions = $(dataHtml).find("table")[0];
  //             // this.vacancyPositions = $(dataHtml).find("table")[0];

  //             console.log(_vacancyPositions);

  //             // console.log(dataHtml);
  //             // console.log($(dataHtml).find("table")[0]);        
  //         });
  // }

  deleteView(deleteCode) {
    console.log('deleteItem' + deleteCode);

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
            this.deleteItem(deleteCode)
          }
        }
      ]
    });
    confirm.present();
  }

  deleteItem(deleteCode) {
    let collegesListLength = this.collegesList.length;
    for (let i = 0; i < collegesListLength; i++) {
      if (this.collegesList[i].ccode === deleteCode) {
        this.collegesList.splice(i, 1);

        this.ga.startTrackerWithId('UA-103091347-1')
          .then(() => {
            this.ga.trackView('HomePage:Delete:' + this.collegesList[i].cname);
          })
          .catch(e => console.log('Error starting GoogleAnalytics', e));


        this.saveStore();
        break;
      }
    }
  }

  presentPopover(ev) {

    let collegeModal = this.modalCtrl.create(AddCollegeModal);
    collegeModal.onDidDismiss(data => {
      //  console.log(data);
      if (data) {
        this.getDetailedPage(data.ccode);
      }
    });
    collegeModal.present();

  }

  viewBranches(viewItem: any) {
    let viewCollegeModal = this.modalCtrl.create(ViewCollegeModal, { viewItem: viewItem });
    viewCollegeModal.onDidDismiss(deleteItem => {
      //  console.log(data);
      if (deleteItem) {
        this.deleteView(deleteItem);
      }
    });
    viewCollegeModal.present();
  }

  getTimeAgo(dateTime) {
    console.log(dateTime)
    return moment(dateTime).fromNow();
  }

  shareApp() {
    this.socialSharing.share('Body', 'Subject', '', 'http://www.saravanakumar.org').then(() => {
      // Success!

      this.ga.startTrackerWithId('UA-103091347-1')
        .then(() => {
          this.ga.trackView('HomePage:shareApp');
        })
        .catch(e => console.log('Error starting GoogleAnalytics', e));

    }).catch(() => {
      // Error!
    });
  }

}
