import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

/**
 * Generated class for the TicketsListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tickets-list',
  templateUrl: 'tickets-list.html',
})
export class TicketsListPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TicketsListPage');
  }

  viewTicketDetails(){
    const modal = this.modalCtrl.create('TicketDetailsPage');
    modal.present();
  }

}
