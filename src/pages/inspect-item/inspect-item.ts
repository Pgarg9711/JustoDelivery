import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AuthProvider} from "../../providers/auth/auth";
import {ItemsInspectionProvider} from "../../providers/items-inspection/items-inspection";
import { IonicSelectableComponent } from 'ionic-selectable';
import { CommonProvider} from "../../providers/common/common";
import { RECEIVE_IN_STATUS, DEFECTIVE_STATUS, RECEIVE_IN_STATUS_FORMATTED, DEFECTIVE_STATUS_FORMATTED } from '../../providers/constants/constants';


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

    itemsList: any;
    receiveInRecordDetails: any = '';
    inspectionID: any;
    itemShown: null;
    showSubStatus = [];
    public rackList: Rack[];
    public selectedRack = [];
    item_status = [];
    defective_status = [];
    racks_id = [];
    notes = [];
    item_id = [];
    itemDetailsArr = [];

    receiveInStatus = RECEIVE_IN_STATUS;
    defectiveStatus = DEFECTIVE_STATUS;
    receiveInStatusText = RECEIVE_IN_STATUS_FORMATTED;
    defectiveStatusText = DEFECTIVE_STATUS_FORMATTED;
    api_token: any;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public authProvider: AuthProvider,
                public commonProvider: CommonProvider,
                public inspectionProvider: ItemsInspectionProvider) {
    }

    ionViewWillLeave(){
        this.navCtrl.getPrevious().data.dataFromNextPage={inspectionID: this.inspectionID};
    }

    ionViewDidEnter(){
        let receivedData = this.navParams.get('data');  // Getting data sent by previous page
        console.log('Received Data', receivedData);
        if(receivedData){
            this.itemsList = receivedData.items;  // Array of items for inspection
            console.log(this.itemsList);
            this.receiveInRecordDetails = receivedData.receiveInRecordDetails; // Receinve in Record ID
            this.inspectionID = receivedData.inspectionID;
            this.itemDetailsArr = receivedData.itemDetailsArr;
            this.getRackList();
        }

        this.authProvider.getLoginUserToken().then((val) => {
            if (val) {this.api_token = val;}
            else{this.authProvider.logout();}
        });

        this.toggleItem(0);        // First Accordian Open
        console.log(this.itemDetailsArr);
        for(let i=0;i<this.itemsList.length;i++){

            // For Status of ITEM
            if(this.itemDetailsArr[i].itemStatusFormatted == RECEIVE_IN_STATUS_FORMATTED.INSPECTION_PENDING){
                this.item_status[i] = RECEIVE_IN_STATUS.INSPECTION_PENDING;
            }
            else if(this.itemDetailsArr[i].itemStatusFormatted == RECEIVE_IN_STATUS_FORMATTED.INSPECTION_DEFECTIVE){
                this.item_status[i] = RECEIVE_IN_STATUS.INSPECTION_DEFECTIVE;
                this.showSubStatus[i] = true;    // Showing Defective Dropdown
            }
            else if(this.itemDetailsArr[i].itemStatusFormatted == RECEIVE_IN_STATUS_FORMATTED.INSPECTION_DONE){
                this.item_status[i] = RECEIVE_IN_STATUS.INSPECTION_DONE;
            }
            else{
                this.item_status[i] = RECEIVE_IN_STATUS.INSPECTION_PENDING;
            }

            // For Defective Status of ITEM
            if(this.itemDetailsArr[i].itemDefectiveStatusFormatted == DEFECTIVE_STATUS_FORMATTED.REPAIRED){
                this.defective_status[i] = DEFECTIVE_STATUS.REPAIRED;
            }
            else if(this.itemDetailsArr[i].itemDefectiveStatusFormatted == DEFECTIVE_STATUS_FORMATTED.REPLACED){
                this.defective_status[i] = DEFECTIVE_STATUS.REPLACED;
            }
            else if(this.itemDetailsArr[i].itemDefectiveStatusFormatted == DEFECTIVE_STATUS_FORMATTED.NOT_DONE){
                this.defective_status[i] = DEFECTIVE_STATUS.NOT_DONE;
            }
            else{
                this.defective_status[i] = '';
            }
            this.racks_id[i] = this.itemDetailsArr[i].rackID;
            this.notes[i] = this.itemDetailsArr[i].notes;
            this.item_id[i] = this.itemDetailsArr[i].itemId;
            if(this.itemDetailsArr[i].rackName && this.itemDetailsArr[i].rackID){
                this.selectedRack[i] = {id: this.itemDetailsArr[i].rackID, rack_name: this.itemDetailsArr[i].rackName};
            }
            else{
                this.selectedRack[i] = '';
            }

        }
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
        return this.itemShown === item;
    }


    inspectionStatusChanged(i){
        console.log(this.item_status[i]);
        if(this.item_status[i] == RECEIVE_IN_STATUS.INSPECTION_DEFECTIVE){
            this.showSubStatus[i] = true;
            this.defective_status[i] = 0;
        }
        else{
            this.showSubStatus[i] = false;
            this.defective_status[i] = '';
        }

    }


    // To FEtch Rack List
    getRackList(){
        this.authProvider.getLoginUserToken().then((val) => {
            if (val) {
                this.inspectionProvider.getRackList({'user_api_token': val}).then((res: any)=>{
                    if (res.status == true) {
                        let rack = [];
                        console.log('Rack Data', res.data);
                        for(let i=0;i<res.data.length;i++){
                            rack.push({
                                    id: res.data[i].id,
                                    rack_name: res.data[i].rack_name
                                });
                        }
                        this.rackList = rack;
                        console.log(this.rackList);
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
    }, i) {
        this.racks_id[i] = event.value.id;
        console.log(event);
        console.log(event.value.id);

    }

    // Button Click of 'Add Images Functionality'
    add_item_images(item_id){
        let data = {'itemID': item_id, 'inspectioID': this.inspectionID};
        this.navCtrl.push('ReceivingItemsImagesPage', {data: data});
    }

    // Saving Items details.
    saveButtonClicked(button){
        let data = {
            'item_id': this.item_id,
            'item_status' : this.item_status,
            'defective_status': this.defective_status,
            'racks_id': this.racks_id,
            'notes': this.notes,
            'user_api_token': this.api_token
        };

        if(button == 'save'){
            data['action'] = 'save';

        }
        else if(button == 'continue'){
            data['action'] = 'save_and_new';
        }
        else if(button == 'later'){
            data['action'] = 'save_and_finish_later';
        }

        let loader = this.commonProvider.presentLoading();
        this.inspectionProvider.saveArrivalItemsDetails(data).then((res:any)=>{
            loader.dismissAll();
            if(res){
                if(res.status == true){
                    this.commonProvider.show_basic_alert('Success', res.message);
                }
            }
            else{
                this.commonProvider.show_basic_alert('Error', 'Something Went Wrong');
            }
            if(button == 'later'){
                this.navCtrl.popToRoot();
            }
            else if(button == 'continue'){
                this.inspectionID = '';
                this.navCtrl.pop();
            }
        })
        .catch((err)=>{
            loader.dismissAll();
            console.log(err);
        })
    }

    backButtonClicked(){
        this.navCtrl.pop();
    }
}
