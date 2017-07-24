import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController } from 'ionic-angular';

import * as path from '../../app/constants/paths';

@Component({
    templateUrl: 'viewBranch-template.html'
})
export class ViewBranchModal {
      
  
private viewItem:any;
    constructor(
        public viewCtrl: ViewController,
        params: NavParams,
        public alertCtrl: AlertController
    ) {
        this.viewItem = params.get('viewItem');
        console.log(this.viewItem);
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


    dismiss() {
        this.viewCtrl.dismiss(null);
    }
}