import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AuthProvider} from "../../providers/auth/auth";
import {ItemsInspectionProvider} from "../../providers/items-inspection/items-inspection";
import { IonicSelectableComponent } from 'ionic-selectable';

/**
 * Generated class for the InspectItemPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class Rack {
    public id: number;
    public rack_name: string;
}

@IonicPage()
@Component({
    selector: 'page-inspect-item',
    templateUrl: 'inspect-item.html',
})
export class  InspectItemPage {
    private itemsList: any;
    private receiveInRecordID: any;
    private inspectionID: any;
    private itemShown: null;
    public itemInspectionStatus = [];
    public showSubStatus = [];
    rackList: Rack[];
    rack: Rack;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public authProvider: AuthProvider,
                public inspectionProvider: ItemsInspectionProvider) {
        let receivedData = this.navParams.get('data');  // Getting data sent by previous page
        if(receivedData){
            this.itemsList = receivedData.items;  // Array of items for inspection
            this.receiveInRecordID = receivedData.receiveInRecordID; // Receinve in Record ID
            this.inspectionID = receivedData.inspectionID;
            this.getRackList();
        }

        this.itemsList = [
            {
                'item_id':2,
                'item_name': 'abx'
            },
            {
                'item_id':3,
                'item_name': 'abc'
            }
        ];

        this.toggleItem(0);        // First Accordian Open
    }

    // For Accordian Functionality
    toggleItem(item){
        if (this.isItemShown(item)) {
            this.itemShown = null;
        } else {
            this.itemShown = item;
        }
    }

    // Return Bool if Item shown
    isItemShown(item){
        console.log(item);
        return this.itemShown === item;
    }


    inspectionStatusChanged(i){
        console.log(this.itemInspectionStatus);
        this.showSubStatus[i] = true;
    }


    // To FEtch Rack List
    getRackList(){
        this.authProvider.getLoginUserToken().then((val) => {
            if (val) {
                this.inspectionProvider.getRackList({'user_api_token': val}).then((res: any)=>{
                    if (res.status == true) {
                        this.rackList = res.data;
                    }
                    else{
                        console.log(res);
                    }
                })
                    .catch((err) => {
                        console.log(err);
                    });
            }
            else{
                console.log('user token missing')
            }
        });
    }

    // Function Used by Selectable Plugin for search
    rackChange(event: {
        component: IonicSelectableComponent,
        value: any
    }) {
        console.log('port:', event.value);
    }

    // Button Click of 'Add Images Functionality'
    add_item_images(item_id){
        let data = {'itemID': item_id, 'inspectioID': this.inspectionID};
        this.navCtrl.push('ReceivingItemsImagesPage', {data: data});
    }
}
