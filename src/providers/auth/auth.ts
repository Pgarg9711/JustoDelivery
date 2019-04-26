import { HttpClient } from '@angular/common/http';
import {Injectable, ViewChild} from '@angular/core';
import {SITE_URLS} from "../constants/constants";
import { Storage } from "@ionic/storage";
import {App} from "ionic-angular";
import {CommonProvider} from "../common/common";

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {

    url = SITE_URLS.API_URL;  // API URL
    version = SITE_URLS.VERSION;  // API VERSION
    final_url = this.url + this.version;  // FINAL URL

    constructor(private http: HttpClient,
                public storage: Storage,
                public _app:App,
                public commonProvider: CommonProvider) {
        console.log('Hello AuthProvider Provider');
    }


    // Function For Login User
    login(data) {

        return  new Promise((resolve, reject) => {
            this.http.post(this.final_url+"/login", {email: data.email, password: data.password})
                .subscribe(res => {
                    return resolve(res);
                }, error1 => {
                    return reject(error1);
                })
        });
    }

    getLoginUserToken(){
        return this.storage.get('JST_USER_DETAILS').then((value:any)=>{
            if(value) {
                return value.api_token;
            }
        });
    }

    logout(btnClicked = null){
        console.log('logging out');
        this.storage.remove('JST_USER_DETAILS');
        this._app.getRootNavs()[0].setRoot('SignInPage').catch(e=>console.error(e));
        if(btnClicked == null) {
            this.commonProvider.show_basic_alert('Invalid User', 'Logged out due to invalid Login');
        }
    }
}
