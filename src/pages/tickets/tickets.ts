import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';


/**
 * Generated class for the TicketsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tickets',
  templateUrl: 'tickets.html',
})
export class TicketsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TicketsPage');
  }
  commentButtonClicked() {
    const prompt = this.alertCtrl.create({
      title: 'Comment',
      inputs: [
        {
          name: 'comment',
          placeholder: 'comment'
        },
      ],
      buttons: [
        {
          text: 'Save',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save & Add Images',
          handler: data => {
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }

  stopButtonClicked(){
    const prompt = this.alertCtrl.create({
      message:'Have you done your work?',
      inputs: [
        {
          name: 'Comment',
          placeholder: 'Add Comment'
        },
        {
          name: 'Range',

        }
      ],
      buttons: [
        {
          text: 'Complete',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Stop',
          handler: data => {
            console.log('Saved clicked');
          }
        },
        {
          text: 'Continue',
          handler: data => {
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();

  }

}
