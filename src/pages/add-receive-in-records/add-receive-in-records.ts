import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import { FormControl, FormGroup, Validators} from "@angular/forms";
import {Storage} from "@ionic/storage";
import { ReceiveInRecordsProvider } from "../../providers/receive-in-records/receive-in-records";
import {AuthProvider} from "../../providers/auth/auth";
import {CommonProvider} from "../../providers/common/common";



/**
 * Generated class for the AddReceiveInRecordsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-add-receive-in-records',
    templateUrl: 'add-receive-in-records.html',
})
export class AddReceiveInRecordsPage {
    title = 'New Receive in Record';
    addReceiveInRecordForm: FormGroup;
    formControl;
    api_token:any =  '';
    id:'';

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public storage: Storage,
                public receiveInRecordsProvider: ReceiveInRecordsProvider,
                public commonProvider: CommonProvider,
                public authProvider: AuthProvider) {
        // Setting API token for API call if not exist Logging Out User from System
        this.authProvider.getLoginUserToken().then((val) => {
            if(val) {
                this.api_token = val;
            }
            else{
                this.authProvider.logout();
            }
        });

        // Form Group
        this.addReceiveInRecordForm = new FormGroup({
            quantity: new FormControl('', [
                Validators.required,
                Validators.min(1),
                Validators.max(50),
                Validators.pattern("[0-9]*")
            ]),
            carrier_name: new FormControl(''),
            tracking_number: new FormControl(''),
            user_api_token: new FormControl(''),
            id: new FormControl(''),
            notes: new FormControl('',[
            ])

        });
        this.formControl = this.addReceiveInRecordForm.controls;
    }

    showError(fieldName){
        if(this.addReceiveInRecordForm.controls) {
            if(fieldName == 'quantity'){
                return CommonProvider.getErrorMessage(this.addReceiveInRecordForm.controls, fieldName, 0, 50, 1);
            }
            else if(fieldName == 'notes'){
                return CommonProvider.getErrorMessage(this.addReceiveInRecordForm.controls, fieldName, 0, 350, 1);
            }
            else {
                return CommonProvider.getErrorMessage(this.addReceiveInRecordForm.controls, fieldName, 0);
            }
        }
    }


    // Saving Receive In Record After Validating Form
    saveReceiveInRecord(){
        this.commonProvider.markFormGroupTouched(this.addReceiveInRecordForm.controls);
        if(this.addReceiveInRecordForm.valid){
            let loader = this.commonProvider.presentLoading();
            this.receiveInRecordsProvider.save_receive_in_record(this.addReceiveInRecordForm.value).then((res:any)=>{
                if(res.status == true){
                    this.id  = res.data.last_record_id;
                    loader.dismissAll();
                    this.navCtrl.push('ReceiveInRecordsPage', {data:res.data}); // SENDING DATA TO NEXT PAGE
                }
                else{
                    loader.dismissAll();
                    this.commonProvider.show_basic_prompt(res.message);
                }
            }).catch((err)=>{
                loader.dismissAll();
                this.commonProvider.show_basic_alert('error', 'Connection Error, Try Again!');
            })
        }

    }

}
