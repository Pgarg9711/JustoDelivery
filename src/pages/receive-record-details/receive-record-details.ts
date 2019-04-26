import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RECEIVE_IN_RECORD_STATUS } from "../../providers/constants/constants";
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

    receiveInRecordStatus = RECEIVE_IN_RECORD_STATUS;
    inspectionBtn: any;
    arrivalRecordDetails: any = '';
    statusColor = 'danger';
    api_token = '';
    itemShown=null;
    savedInspectionItems = '';
    RECV_DETAILS_ARRAY = [];

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public authProvider: AuthProvider,
                public inspectionItemProvider: ItemsInspectionProvider,
                public commonProvider: CommonProvider
    ){
        let data = this.navParams.get('data'); // Data sent by Scanner Page
        if(data){
            this.arrivalRecordDetails = data.receive_in_record_details;   // Arrival Record Details
            console.log(this.arrivalRecordDetails);
            if(this.arrivalRecordDetails.record_status_formatted) {
                if (this.arrivalRecordDetails.record_status_formatted == RECEIVE_IN_RECORD_STATUS.INSPECTION_COMPLETED) { // Condition For Completed Inspection
                    this.statusColor = "secondary";
                }
                else if (this.arrivalRecordDetails.record_status_formatted == RECEIVE_IN_RECORD_STATUS.INSPECTION_IN_PROGRESS) { // Condition for Inspection in Progress
                    this.statusColor = "warning";
                    this.inspectionBtn = "resume";
                }
                else if (this.arrivalRecordDetails.record_status_formatted == RECEIVE_IN_RECORD_STATUS.INSPECTION_PENDING) {  // Condition For Pending Inspection
                    this.statusColor = "danger";
                    this.inspectionBtn = "begin";
                }
            }

            this.RECV_DETAILS_ARRAY = [
                {name: 'Receiver', value:this.arrivalRecordDetails.receiver_clerk},
                {name: 'Carrier', value:this.arrivalRecordDetails.carrier_name},
                {name: 'Reference', value:this.arrivalRecordDetails.tracking_number},
                {name: 'Qty of Pcs.', value:this.arrivalRecordDetails.quantity_count},
                {name: 'Notes', value:this.arrivalRecordDetails.notes}
            ]
        }
        else{
            this.navCtrl.pop();
        }

        this.authProvider.getLoginUserToken().then((val) => {
            if (val) {
                this.api_token = val;
                let data = {
                    'user_api_token' : val,
                    'receive_in_records_id': this.arrivalRecordDetails.r_id
                };
                this.getSavedInspectionDetails(data);
            }
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ReceiveRecordDetailsPage');
    }
    // Fetching Saved Data of Inspection
    getSavedInspectionDetails(data){
        if(data){
            console.log('function Called', data);
            this.inspectionItemProvider.getInspectionDetails(data).then((res:any)=>{
                if(res.status == true){
                    if(res.data && res.data.final_items_list) {
                        this.savedInspectionItems = res.data.final_items_list;
                        console.log('Data Fetched', res);
                    }
                }
                else{
                    console.log(res.message);
                }
            }).catch((err)=>{
                console.log(err);
            });
        }
    }

    // Pushing Page in stack For Begin Inspection, sending Data of Receive in Record ID
    beginInspection(){
        let data = {'receive_in_record_id': this.arrivalRecordDetails.r_id};
        this.navCtrl.push('BeginInspectionPage', {data: data});
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

    // When View Inspection clicked
    viewInspectionClicked(){
        this.navCtrl.push('ViewInspectionPage');
    }
}
