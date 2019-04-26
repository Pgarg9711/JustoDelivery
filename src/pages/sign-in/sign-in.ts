import {Component} from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {AuthProvider} from "../../providers/auth/auth";
import { Validators,FormControl, FormGroup } from '@angular/forms';
import {Storage} from "@ionic/storage";
import {IMG, VARS} from "../../providers/constants/constants";
import { CommonProvider }from "../../providers/common/common";



/**
 * Generated class for the SignInPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({

    selector: 'page-sign-in',
    templateUrl: 'sign-in.html',
})

export class SignInPage{
    title = 'Sign In Page!';
    loginForm: FormGroup;
    formControl;
    LOGO =IMG.DEFAULT_LOGO;
    constructor(public navCtrl: NavController,
                public provider: AuthProvider,
                public storage: Storage,
                public commonProvider: CommonProvider) {
        this.loginForm = new FormGroup({
            email : new FormControl('', [
                Validators.required,
                Validators.pattern(VARS.EMAIL_PATTERN)
            ]),
            password: new FormControl('', [
                Validators.required,
            ])
        })
        this.formControl = this.loginForm.controls;
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SignInPage');

    }

    showError(fieldName){
        if(this.loginForm.controls) {
            return CommonProvider.getErrorMessage(this.loginForm.controls, fieldName, 0);
        }
    }

    onSignIn(){
        this.commonProvider.markFormGroupTouched(this.loginForm.controls);
        if(this.loginForm.valid) {
            let loader = this.commonProvider.presentLoading();
            this.provider.login(this.loginForm.value).then((res:any)=>{
                console.log(res);
                loader.dismissAll();
                if(res){
                    if(res.status == true){
                        console.log(res);
                        this.storage.set('JST_USER_DETAILS',res.data);
                        this.navCtrl.setRoot('DashboardPage');
                    }
                    else{
                        this.commonProvider.show_basic_alert('Can\'t Login ', res.message);
                    }
                }
                else{
                    this.commonProvider.show_basic_alert('error', 'Something Went Wrong Try Again');
                }
                // this.navCtrl.push('page',res)
            }).catch((err)=>{
                this.commonProvider.show_basic_alert('Error', 'Connection Error, Try Again!');
            });
        }
    }

    onForgotPassword(){
        let loader = this.commonProvider.presentLoading();
        this.navCtrl.push('ForgotPasswordPage');
        console.log('forgot passwd clicked');
    }
}
