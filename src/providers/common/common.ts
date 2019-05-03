
import { Injectable } from '@angular/core';
import {AlertController, Events, LoadingController, ToastController} from "ionic-angular";
import { VALIDATION_ERR_MSG } from "../constants/constants";

/*
  Generated class for the CommonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CommonProvider {

    constructor(public alertCtrl: AlertController,
                public toastCtrl: ToastController,
                public loadingCtrl: LoadingController,
                public event: Events) {
        console.log('Hello CommonProvider Provider');
    }


    // For Displaying Basic Alert Messages
    show_basic_alert(title, subtitle){
        const alert = this.alertCtrl.create({
            title: title,
            subTitle: subtitle,
            buttons: ['OK']
        });
        alert.present();
    }

    // For Confirmation
    show_delete_confirm(title, subtitle) {
        return new Promise((resolve, reject) => {
            const confirm = this.alertCtrl.create({
                title: title,
                message: subtitle,
                buttons: [
                    {
                        text: 'Disagree',
                        handler: () => {
                            return reject(true);
                        }
                    },
                    {
                        text: 'Agree',
                        handler: () => {
                            return resolve(true);
                        }
                    }
                ]
            });
            confirm.present().catch(()=>{});
        });
    }

    // For Displaying Basic Prompt
    show_basic_prompt(text){
        let toast = this.toastCtrl.create({
            message: text,
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }

    presentLoading() {
        const loader = this.loadingCtrl.create({
            spinner: 'bubbles',
            cssClass: 'transparent',
            duration: 4000
        });
        loader.present();
        return loader
    }


    // FORM VALIDATION
    static getErrorMessage(formControl, fieldName, uType, maxamt=0, minamt=0, edit=0) {
        let eMsg ='';       // Error Message

        if(fieldName == 'email' && formControl.email.touched){
            if(formControl.email.hasError('required') || !formControl.email.value.trim()){
                eMsg=VALIDATION_ERR_MSG.REQUIRED_FIELD_ERR;
            }
            if(formControl.email.hasError('pattern')) {
                eMsg= VALIDATION_ERR_MSG.EMAIL_PATTERN_ERR;
            }
        }
        if(fieldName == 'password' && formControl.password.touched){
            if(formControl.password.hasError('required') || !formControl.password.value.trim()){
                eMsg=VALIDATION_ERR_MSG.REQUIRED_FIELD_ERR;
            }
            if(formControl.password.hasError('minLength')) {
                eMsg = VALIDATION_ERR_MSG.PASS_MIN_LENGTH;
            }
        }
        if(fieldName == 'quantity' && formControl.quantity.touched){
            if(formControl.quantity.hasError('required') || !formControl.quantity.value.trim()){
                eMsg = VALIDATION_ERR_MSG.REQUIRED_FIELD_ERR;
            }

            if(formControl.quantity.hasError('pattern')) {
                eMsg = VALIDATION_ERR_MSG.NUMERIC_ONLY;
            }

            if(formControl.quantity.hasError('min')){
                eMsg = VALIDATION_ERR_MSG.GREATER_THAN_ZERO;
            }

            if(formControl.quantity.hasError('max')){
                eMsg = "Value should be Less than or Equal to "+maxamt;
            }
        }

        if(fieldName == 'notes' && formControl.notes.touched){
            if(formControl.notes.hasError('max')){
                console.log('d');
                eMsg = "Max "+ maxamt +"Character allowed!";
            }
        }

        if(fieldName == 'receiveInCode' && formControl.receiveInCode.touched){
            if(formControl.receiveInCode.hasError('required') || !formControl.receiveInCode.value.trim()){
                eMsg = VALIDATION_ERR_MSG.REQUIRED_FIELD_ERR;
            }

            if(formControl.receiveInCode.hasError('min')){
                eMsg = VALIDATION_ERR_MSG.GREATER_THAN_ZERO;
            }
        }
        return eMsg;
    }

    markFormGroupTouched(formControl) {
        Object.keys(formControl).map(x => formControl[x]).forEach(control => {
            if(control) {
                control.markAsTouched();
            }
            if (control.controls) {
                this.markFormGroupTouched(control);
            }
        });
    }

}
