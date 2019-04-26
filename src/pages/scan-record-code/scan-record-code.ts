import {ChangeDetectorRef, Component, NgZone} from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {ReceiveInRecordsProvider} from "../../providers/receive-in-records/receive-in-records";
import {CommonProvider} from "../../providers/common/common";
import {AuthProvider} from "../../providers/auth/auth";
import {IMG} from "../../providers/constants/constants";
import { FormControl, FormGroup, Validators} from "@angular/forms";


/**
 * Generated class for the ScanRecordCodePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-scan-record-code',
    templateUrl: 'scan-record-code.html',
})
export class ScanRecordCodePage {
    private myCallbackFunction: any;
    SCAN_BTN = IMG.SCAN_QR_BTN;
    scanQRCodeForm: FormGroup;
    formControl;
    receiveInCode: any;
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public event: Events,
                public zone: NgZone,
                public recvInRecorderProvider: ReceiveInRecordsProvider,
                public commonProvider: CommonProvider,
                public authProvider: AuthProvider,
                private ref: ChangeDetectorRef,) {

        this.event.subscribe('JTD_SCANNED_TEXT',(data)=>{
            this.zone.run(()=>{
                this.ref.detectChanges(); // trigger change detection cycle
                this.formControl['receiveInCode'].setValue(data);
                this.viewInspectionDetails();
            });
        });
        // Form Group
        this.scanQRCodeForm = new FormGroup({
            receiveInCode: new FormControl('', [
                Validators.required,
                Validators.min(1),
            ]),
        });
        this.formControl = this.scanQRCodeForm.controls;
    }

    showError(fieldName){
        return CommonProvider.getErrorMessage(this.scanQRCodeForm.controls, fieldName, 0,0 , 1);
    }

    // It will redirect to Next Page After fetching details of Receive in record.
    viewInspectionDetails(){
        this.commonProvider.markFormGroupTouched(this.scanQRCodeForm.controls);
        if(this.scanQRCodeForm.valid) {
            let loader = this.commonProvider.presentLoading();
            let formValue = this.scanQRCodeForm.value;
            let receiveInCode = formValue.receiveInCode;
            this.authProvider.getLoginUserToken().then((val) => {   // Fetching API token for API Call
                if (val) {
                    let data = {
                        'id': receiveInCode, 'user_api_token': val
                    };
                    this.recvInRecorderProvider.scanArrivalImages(data).then((res: any) => {  // Calling API function
                        loader.dismissAll();
                        if (res.status == true) {
                            if (res.data && res.data != undefined) {
                                let data = res.data;
                                let receivingDetails = data.receive_in_record_details;
                                if (receivingDetails.r_id) {  // On Success Push Next Page  to Stack
                                    this.navCtrl.push('ReceiveRecordDetailsPage', {data: res.data});
                                } else {
                                    this.commonProvider.show_basic_prompt('Receiving Record Not found');
                                }
                            } else {
                                this.commonProvider.show_basic_prompt('Receiving Record Not found');
                            }
                        } else {
                            this.commonProvider.show_basic_prompt('Receiving Record Not found');
                            console.log('status false');
                        }

                    }).catch((err) => {
                        loader.dismissAll();
                        this.commonProvider.show_basic_prompt('Connection Error, Try Again!');
                    });
                } else {
                    loader.dismissAll();
                    this.authProvider.logout();
                }
            });
        }
    }
}
