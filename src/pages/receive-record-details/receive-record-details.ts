import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RECEIVE_IN_RECORD_STATUS_CODE, RECEIVE_IN_STATUS, DEFECTIVE_STATUS, PLM_ENTITY } from "../../providers/constants/constants";
import {AuthProvider} from "../../providers/auth/auth";
import {ItemsInspectionProvider} from "../../providers/items-inspection/items-inspection";
import {CommonProvider} from "../../providers/common/common";


/**
 * Generated class for the ReceiveRecordDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-receive-record-details',
    templateUrl: 'receive-record-details.html',
})
export class ReceiveRecordDetailsPage {

    receiveInRecordStatusCode = RECEIVE_IN_RECORD_STATUS_CODE;      // Checking Code received from API
    RECV_DETAILS_ARRAY = [];        // Array to hold Receive iN Record Data
    inspectionBtn: any;
    arrivalRecordDetails: any = '';
    statusColor = 'danger';
    recordLabelPrinted = 0;
    recordNewLabelRequest = 0;
    api_token = '';
    itemShown=null;
    savedInspectionItems = [];

    showSpinner = true; // Showing Spinner while inspection of items load


    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public authProvider: AuthProvider,
                public inspectionItemProvider: ItemsInspectionProvider,
                public commonProvider: CommonProvider){}



    // When Page Load
    ionViewDidEnter(){
        let data = this.navParams.get('data'); // Data sent by Scanner Page (Receive in Record Details)
        if(data){
            this.arrivalRecordDetails = data.receive_in_record_details;   // Arrival Record Details
            if(this.arrivalRecordDetails) {
                if (this.arrivalRecordDetails.record_status_formatted) {
                    if (this.arrivalRecordDetails.record_status_code == this.receiveInRecordStatusCode.INSPECTION_COMPLETED) { // Condition For Completed Inspection
                        this.statusColor = "secondary";
                    } else if (this.arrivalRecordDetails.record_status_code == this.receiveInRecordStatusCode.INSPECTION_IN_PROGRESS || this.arrivalRecordDetails.record_status_code == this.receiveInRecordStatusCode.INSPECTION_IN_PROGRESS_ATT_REQ) { // Condition for Inspection in Progress
                        this.statusColor = "warning";
                        this.inspectionBtn = "resume";
                    } else if (this.arrivalRecordDetails.record_status_code == this.receiveInRecordStatusCode.INSPECTION_PENDING) {  // Condition For Pending Inspection
                        this.statusColor = "danger";
                        this.inspectionBtn = "begin";
                    }
                }
                this.RECV_DETAILS_ARRAY = [{
                    name: 'Receiver',
                    value: this.arrivalRecordDetails.receiver_clerk
                }, {name: 'Carrier', value: this.arrivalRecordDetails.carrier_name}, {
                    name: 'Reference',
                    value: this.arrivalRecordDetails.tracking_number
                }, {name: 'Qty of Pcs.', value: this.arrivalRecordDetails.quantity_count}, {
                    name: 'Notes',
                    value: this.arrivalRecordDetails.notes
                }]
            }
            else{
                this.navCtrl.pop();
            }
        }
        else{
            this.navCtrl.pop();
        }
        // Getting Logged in User Token, If not any value then logging out
        this.authProvider.getLoginUserToken().then((val) => {
            if (val) {
                this.api_token = val;
                let data = {
                    'user_api_token' : val,
                    'receive_in_records_id': this.arrivalRecordDetails.r_id
                };
                this.getSavedInspectionDetails(data);       // Calling Function to Fetch Inspection of this Receive in REcord

            }
            else{
                this.authProvider.logout();
            }

        });
    }

    // Fetching Saved Data of Inspection of Receive in REcord
    getSavedInspectionDetails(data){
        if(data){
            this.inspectionItemProvider.getInspectionDetails(data).then((res:any)=>{    // Calling API
                this.showSpinner = false;
                if(res.status == true){     // If data found
                    if(res.data && res.data.final_items_list) {
                        this.savedInspectionItems = res.data.final_items_list;  // List of Inspections
                        console.log(this.savedInspectionItems);
                        for(let i=0;i<this.savedInspectionItems.length;i++){
                            let inspection = this.savedInspectionItems[i];
                            for(let j=0;j<inspection.length;j++){
                                this.updatePrintCount(inspection[j].r_item_id, PLM_ENTITY.ACTUAL_ITEM, i, j);
                            }
                        }
                        this.updatePrintCount(this.arrivalRecordDetails.r_id, PLM_ENTITY.TEMP_LABEL);   // Updating Count for Temp Labels
                    }
                }
                else{   // Else nothing
                    console.log(res.message);
                }
            }).catch((err)=>{
                this.showSpinner = false;
                console.log(err);
            });
        }else{
            this.showSpinner = false;
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


    // Checking Status of Items in Inspection
    isItemInspectionCompleted(inspection, item){
        let status = this.savedInspectionItems[inspection][item].status;
        let defectiveStatus = this.savedInspectionItems[inspection][item].defective_status;
        if(status == RECEIVE_IN_STATUS.INSPECTION_DONE ||
            (status == RECEIVE_IN_STATUS.INSPECTION_DEFECTIVE && defectiveStatus == DEFECTIVE_STATUS.REPAIRED)||
            (status == RECEIVE_IN_STATUS.INSPECTION_DEFECTIVE && defectiveStatus == DEFECTIVE_STATUS.REPLACED))
        {
            return true;
        }
        else{
            return false;
        }
    }

    // Print Request for Item Label
    printItemLabel(itemId, i, j){
        if(itemId){
            let apiData = {
                'e_id':itemId,
                'user_api_token': this.api_token
            };
            let loader = this.commonProvider.presentLoading();
            this.inspectionItemProvider.printItemLabelRequest(apiData).then((res:any)=>{    // Sendin request to print label
                console.log(res);
                loader.dismissAll();
                if(res){
                    if(res.status == true){     // If Request successful
                        this.commonProvider.show_basic_prompt(res.message);
                        this.updatePrintCount(itemId, PLM_ENTITY.ACTUAL_ITEM, i, j); // Updating label print count
                    }
                    else{
                        this.commonProvider.show_basic_prompt(res.message);
                    }
                }
                else{
                    this.commonProvider.show_basic_prompt('Something Went Wrong!');
                }
            })
            .catch((err)=>{
                this.commonProvider.show_basic_prompt(err);
            })
        }
        else{
            this.commonProvider.show_basic_prompt('Item ID is Required for Print Request');
        }
        console.log('printing...');
    }

    // Printing Request for Temp Labels
    printTempLabel(){
        let apiData = {
            'e_id':this.arrivalRecordDetails.r_id,
            'user_api_token': this.api_token
        };
        let loader = this.commonProvider.presentLoading();
        this.inspectionItemProvider.printTempLabelRequest(apiData).then((res:any)=>{
            console.log('Print Label', res);
            loader.dismissAll();
            if(res){
                if(res.status == true){
                    this.commonProvider.show_basic_prompt(res.message);
                    this.updatePrintCount(this.arrivalRecordDetails.r_id, PLM_ENTITY.TEMP_LABEL);
                }
                else{
                    this.commonProvider.show_basic_prompt(res.message);
                }
            }
            else{
                this.commonProvider.show_basic_prompt('Something Went Wrong!');
            }
        })
        .catch((err)=>{
            this.commonProvider.show_basic_prompt(err);
        })
    }


    // Getting Print Counts for Labels
    updatePrintCount(entityID, entityType,i=0,j=0){
        let apiData = {
            'e_id':entityID,
            'e_type': entityType,
            'user_api_token': this.api_token
        };
        console.log('API Data', i,j);
        this.inspectionItemProvider.getPrintCounts(apiData).then((res:any)=>{
            console.log('Print Label Request', res);
            if(res && res.status == true){
                if(res.data) {
                    if (entityType == PLM_ENTITY.ACTUAL_ITEM) {     // For Item saving vaues in OBJECT
                        this.savedInspectionItems[i][j].new_label_count = res.data.new_label_count;
                        this.savedInspectionItems[i][j].printed_label_count = res.data.printed_label_count;
                    }
                    else if (entityType == PLM_ENTITY.TEMP_LABEL) {     // Setting Vars for Label Print count
                        this.recordLabelPrinted = res.data.printed_label_count;
                        this.recordNewLabelRequest = res.data.new_label_count;
                    }
                }
            }
        })
        .catch((err)=>{
            console.log(err);
        });
    }

    // Pushing Page in stack For Begin Inspection, sending Data of Receive in Record ID
    beginInspection(inspectionItemsID = null){  // In Case of Edit Inspection ID.
        let data = {
            'receiveInRecordID': this.arrivalRecordDetails.r_id,
            'inspectionItemsID': inspectionItemsID,
            'receiveInRecordDetails': this.arrivalRecordDetails
        };
        this.navCtrl.push('BeginInspectionPage', {data: data});
    }
}
