import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SITE_URLS } from "../constants/constants";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { CommonProvider } from "../common/common";
import {AuthProvider} from "../auth/auth";
import {MyApp} from "../../app/app.component";


let api_url = SITE_URLS.API_URL+SITE_URLS.VERSION;
@Injectable()
export class ReceiveInRecordsProvider  {
  constructor(public http: HttpClient,
              private inAppBrowser: InAppBrowser,
              public commonProvider: CommonProvider,
              public authProvider: AuthProvider) {
    console.log('Hello RecieveInRecordProvider Provider');
  }

  // Saving receive in Record data
  save_receive_in_record(data){
    return new Promise((resolve, reject)=>{
      // data.user_api_token = MyApp.USER_TOKEN;
          this.http.post(api_url+"/save/new/receive/in/record", data)
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

  // Fetching Receive in Record Data
  getReceiveInRecord(data){
    return new Promise((resolve, reject)=>{
      this.http.post(api_url+"/get/receive/in/record", data)
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


  // Fetching images of Arrival Record
  getArrivalRecordImages(data){
    return new Promise((resolve, reject)=>{
      this.http.post(api_url+"/get/arrival/images", data)
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

  //Redirecting to URL in Browser
  printLabel(data){
    if(data != undefined && data){
      this.inAppBrowser.create(api_url+data, '_system');
    }
    else{
      this.commonProvider.show_basic_prompt('Missing Arguments');
    }
  }


  // Function For Showing details of Receive in Record Details AFter scanning
  scanArrivalImages(data){
    console.log(api_url+"/scan/arrival/record");
    if(data && data != undefined){
      return new Promise((resolve, reject)=>{
        this.http.post(api_url+"/scan/arrival/record", data)
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
    else{
      this.commonProvider.show_basic_prompt('Missing Arguments');
    }
  }


  // Fetching Items details by Receive in Record ID
  getReceiveInRecordItemsDetails(data){
    if(data && data!= undefined){
      return new Promise((resolve, reject)=>{
        this.http.post(api_url+'/get/item/details', data)
          .subscribe(
            res=>{
              if(res['status'] == -1){
                this.authProvider.logout();
              }
              else {
                return resolve(res);
              }
            },
            error1 => {
              return resolve(error1);
            }
          )

      })
    }
    else{
      this.commonProvider.show_basic_prompt('Missing Arguments');
    }
  }

  // Adding Inspection Item by parent_item_id and receive_in_records_id.
  addInspectionItem(data){
    if(data && data!= undefined){
      return new Promise((resolve, reject)=>{
        this.http.post(api_url+'/add/inspection/item', data)
          .subscribe(
            res=>{
              if(res['status'] == -1){
                this.authProvider.logout();
              }
              else {
                return resolve(res);
              }
            },
            error1 => {
              return resolve(error1);
            }
          )

      })
    }
    else{
      this.commonProvider.show_basic_prompt('Missing Arguments');
    }
  }

  // Delete Item from Receive in Record
  deleteInspectionItem(data){
      if (data && data != undefined) {
        return new Promise((resolve, reject) => {
          this.http.post(api_url + '/delete/inspection/item', data)
            .subscribe(res => {
              if(res['status'] == -1){
                this.authProvider.logout();
              }
              else {
                return resolve(res);
              }
            }, error1 => {
              return resolve(error1);
            })

        })
      } else {
        this.commonProvider.show_basic_prompt('Missing Arguments');
      }
  }
}
