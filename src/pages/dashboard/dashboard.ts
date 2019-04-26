import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IMG } from "../../providers/constants/constants";

/**
 * Generated class for the DashboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-dashboard',
    templateUrl: 'dashboard.html',
})
export class DashboardPage {
    _CARD:any=[];

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        this._CARD = [
            { cardName: 'Receive In', img: IMG.RECEIVER_ICON, cssClass: 'receiver_icon' },
            { cardName: 'Scan QR', img: IMG.SCAN_QR_ICON, cssClass: 'scan_qr_icon' },
            { cardName: 'Tickets', img: IMG.TICKET_ICON, cssClass: 'tickets' },
            { cardName: 'Move Items', img: IMG.MOVE_ICON, cssClass: 'move_item' }
        ];
    }

    onClickThis(i){
        console.log(i);
        switch(i) {
            case 0:{
                this.navCtrl.push('AddReceiveInRecordsPage');
                break;
            }
            case 1:{
                this.navCtrl.push('ScanRecordCodePage');
                break;
            }
            case 2:{
                this.navCtrl.push('TicketsListPage');
                break;
            }
            case 3:{
                break;
            }
        }

    }
}
