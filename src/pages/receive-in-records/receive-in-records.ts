import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AuthProvider} from "../../providers/auth/auth";
import {CommonProvider} from "../../providers/common/common";
import {ReceiveInRecordsProvider} from "../../providers/receive-in-records/receive-in-records";
import { InAppBrowser } from '@ionic-native/in-app-browser';
import {PLM_ENTITY} from "../../providers/constants/constants";
import {ItemsInspectionProvider} from "../../providers/items-inspection/items-inspection";

/**
 * Generated class for the ReceiveInRecordsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-receive-in-records',
    templateUrl: 'receive-in-records.html',
})
export class ReceiveInRecordsPage {
    receive_in_record_data: any;
    REC_DETAILS:any = [];
    private itemShown: true;
    recordLabelPrinted = 0;
    recordNewLabelRequest = 0;
    api_token = '';
    WAREHOUSE_CODE = '';
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public inspectionItemProvider: ItemsInspectionProvider,
                public authProvider: AuthProvider,
                public commonProvider: CommonProvider) {
        // Receive in Record id
        this.receive_in_record_data = this.navParams.get('data');   // data sent by Last page
        console.log(this.receive_in_record_data);
        if(this.receive_in_record_data && this.receive_in_record_data.warehouse_code){
            this.WAREHOUSE_CODE  = '#'+this.receive_in_record_data.warehouse_code+this.receive_in_record_data.last_record_id;
        }
        if(this.receive_in_record_data) {

            // if(this.receive_in_record_data.warehouse_code){
            //     this.WAREHOUSE_CODE  = '#'+this.receive_in_record_data.warehouse_code+this.receive_in_record_data.last_record_id;
            // }
            this.REC_DETAILS = [
                { name: 'Carrier', value: this.receive_in_record_data.carrier_name, open: 1},
                { name: 'Reference', value: this.receive_in_record_data.tracking_number, open: 1},
                { name: 'Qty of Pieces', value: this.receive_in_record_data.quantity, open: 1},
                { name: 'Notes', value: this.receive_in_record_data.notes, open: 1},

                // { name: 'Notes', value: '', open: 1}
            ];
            // API token
            this.authProvider.getLoginUserToken().then((val) => { // Getting API token if logged in user
                if (val){
                    this.api_token = val;
                    this.updatePrintCount(this.receive_in_record_data.last_record_id, PLM_ENTITY.TEMP_LABEL);   // Updating Count for Temp Labels
                }// Logging Out if not set Token
                else{
                    this.authProvider.logout();
                }
            });
        }
        else {
            this.navCtrl.pop();
            this.commonProvider.show_basic_prompt('Data Not Found for Receive In Record');
        }
    }
    // Fetching Receive in Record Details and Setting values.
    // getRecordDetails(data){
    //     if(data){
    //         // Calling API for get data
    //         this.rcvRecordProvider.getReceiveInRecord(this.data).then((val:any)=>{
    //             console.log(val);
    //             this.show_spinner = false;
    //             if(val){
    //                 if(val.status == true){
    //                     this.REC_DETAILS = [
    //                         { name: 'Carrier', value: val.data.carrier_name},
    //                         { name: 'Reference', value: val.data.quantity},
    //                         { name: 'Qty of Pieces', value: val.data.tracking_number},
    //                         { name: 'Notes', value: val.data.notes},
    //                     ];
    //                     console.log(this.REC_DETAILS);
    //                 }
    //                 else{
    //                     this.navCtrl.pop();
    //                     this.commonProvider.show_basic_prompt(val.message);
    //                 }
    //             }
    //             else{
    //                 this.navCtrl.pop();
    //                 this.commonProvider.show_basic_prompt('Data Not Found for Receive In Record');
    //             }
    //
    //         }).catch((err)=>{
    //             this.navCtrl.pop();
    //             this.commonProvider.show_basic_alert('Error', 'Connection Error, Try Again!');
    //         });
    //     }
    // }

    // When Edit icon Clicked, PopPage
    editRecord(){
        this.navCtrl.pop();
    }

    // When Add Images Button Clicked, Redirecting to images Page
    add_images(){
        this.navCtrl.push('ReceiveInRecordImagesPage', {data:this.receive_in_record_data});
    }

    // When Print Label Button Clicked, Sending Request to Print
    print_label(){
        // let data = '/warehouse/print/arrival/order/label/'+this.receive_in_record_data.last_record_id;
        // this.rcvRecordProvider.printLabel(data);


        let loader = this.commonProvider.presentLoading();
        let apiData = {
            'e_id':this.receive_in_record_data.last_record_id,
            'user_api_token': this.api_token
        };
        this.inspectionItemProvider.printTempLabelRequest(apiData).then((res:any)=>{
            console.log('Print Label', res);
            if(res){
                if(res.status == true){
                    loader.dismissAll();
                    this.commonProvider.show_basic_prompt(res.message);
                    this.updatePrintCount(this.receive_in_record_data.last_record_id, PLM_ENTITY.TEMP_LABEL);
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


    // For Accordian Functionality
    toggleItem(item){
        if (this.REC_DETAILS[item].open) {
            this.REC_DETAILS[item].open = 0;
        } else {
            this.REC_DETAILS[item].open = 1;
        }
    }

    // Getting Print Counts for Labels
    updatePrintCount(entityID, entityType){
        let apiData = {
            'e_id':entityID,
            'e_type': entityType,
            'user_api_token': this.api_token
        };
        console.log('API Data',apiData);
        this.inspectionItemProvider.getPrintCounts(apiData).then((res:any)=>{
            console.log('Print Label Request', res);
            if(res && res.status == true){
                if(res.data) {
                    if (entityType == PLM_ENTITY.TEMP_LABEL) {
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


}
