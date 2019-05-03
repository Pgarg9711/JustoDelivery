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
    forgotPasswordForm: FormGroup;
    LOGO =IMG.DEFAULT_LOGO;
    isLogin = true;     // By default Login Form
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
        });


        this.forgotPasswordForm = new FormGroup({
            email: new FormControl('',[
                Validators.required,
                Validators.pattern(VARS.EMAIL_PATTERN)
            ])
        });
        // this.formControl = this.loginForm.controls;
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SignInPage');

    }


    // Function for Validation for Login Form
    showError(fieldName){
        if(this.loginForm.controls) {
            return CommonProvider.getErrorMessage(this.loginForm.controls, fieldName, 0);
        }
    }

    // Function for Validation for Forgot password Form
    showErrorForgotPass(fieldName){
        if(this.forgotPasswordForm.controls) {
            return CommonProvider.getErrorMessage(this.forgotPasswordForm.controls, fieldName, 0);
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
                    this.commonProvider.show_basic_alert('Error', 'Something Went Wrong Try Again');
                }
                // this.navCtrl.push('page',res)
            }).catch((err)=>{
                this.commonProvider.show_basic_alert('Error', 'Connection Error, Try Again!');
            });
        }
    }

    sendPasswordResetLink(){
        this.commonProvider.markFormGroupTouched(this.forgotPasswordForm.controls);
        if(this.forgotPasswordForm.valid) {
            let loader = this.commonProvider.presentLoading();
            this.provider.forgotPassword(this.forgotPasswordForm.value).then((res:any)=>{
                loader.dismissAll();
                if(res) {
                    this.commonProvider.show_basic_alert('Success','We have e-mailed your password reset link!');
                    // this.isLogin = true;
                }
            }).catch((err)=>{
                let error = err.error;
                if(error){
                    if(error.status && error.status == 401){
                        this.commonProvider.show_basic_alert('', 'We can\'t find a user with that e-mail address.');
                    }
                    else{
                        this.commonProvider.show_basic_alert('Error', err);
                    }
                }
                else{
                    this.commonProvider.show_basic_alert('Error', err);
                }

            });

        }
    }
}
