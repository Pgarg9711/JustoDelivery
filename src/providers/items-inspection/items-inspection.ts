import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SITE_URLS } from "../constants/constants";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { CommonProvider } from "../common/common";
import {AuthProvider} from "../auth/auth";

/*
  Generated class for the ItemsInspectionProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
let api_url = SITE_URLS.API_URL+SITE_URLS.VERSION;
let userApiToken = '';
@Injectable()
export class ItemsInspectionProvider {
  items: any;
  constructor(public http: HttpClient,
              private inAppBrowser: InAppBrowser,
              public commonProvider: CommonProvider,
              public authProvider: AuthProvider
            ) {

  }


  // Creating Inspection After Scanning
  saveInspection(data){
    return new Promise((resolve, reject)=>{
      this.http.post(api_url+"/save/inspection/by/scan", data)
        .subscribe(
          res =>{
            if(res['status'] == -1){
              console.log(res);
              // this.authProvider.logout();
            }
            else {
              return resolve(res);
            }
          },
          errorl => {
            return resolve(errorl);
          }
        )
    });
  }

  // Fetching RackList
  getRackList(data){
    console.log('dta in funciton', data);
    return new Promise((resolve, reject)=>{
      this.http.post(api_url+"/get/rack/list", data)
        .subscribe(
          res =>{
            if(res['status'] == -1){
              this.authProvider.logout();
            }
            else {
              return resolve(res);
            }
          },
          errorl => {
            return resolve(errorl);
          }
        )
    });
  }

  // Fetching images of Inspection
  getInspectionItemImages(data){
    return new Promise((resolve, reject)=>{
      this.http.post(api_url+"/get/saved/item/images", data)
        .subscribe(
          res =>{
            if(res['status'] == -1){
              this.authProvider.logout();
            }
            else {
              return resolve(res);
            }
          },
          errorl => {
            return resolve(errorl);
          }
        )
    });
  }


  // Getting inspection Details
  getInspectionDetails(data){
    return new Promise((resolve, reject)=>{
      this.http.post(api_url+"/get/inspection/details", data)
        .subscribe(
          res =>{
            if(res['status'] == -1){
              this.authProvider.logout();
            }
            else {
              return resolve(res);
            }
          },
          errorl => {
            return resolve(errorl);
          }
        )
    });
  }
}
