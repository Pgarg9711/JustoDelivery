import { Component } from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams, ViewController} from 'ionic-angular';

/**
 * Generated class for the TicketDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ticket-details',
  templateUrl: 'ticket-details.html',
})
export class TicketDetailsPage {

  constructor(public navCtrl: NavController, public viewCtrl : ViewController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TicketDetailsPage');
  }
  cancelButtonClicked(){
    this.viewCtrl.dismiss();
  }

  startTask(){
    // this.viewCtrl.dismiss();
    this.navCtrl.push('TicketsPage');
  }
}
