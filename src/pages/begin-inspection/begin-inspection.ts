import {ChangeDetectorRef, Component, NgZone} from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {CommonModule} from '@angular/common';
import {ReceiveInRecordsProvider} from "../../providers/receive-in-records/receive-in-records";
import {AuthProvider} from "../../providers/auth/auth";
import {CommonProvider} from "../../providers/common/common";
import {ItemsInspectionProvider} from "../../providers/items-inspection/items-inspection";

/**
 * Generated class for the BeginInspectionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-begin-inspection',
  templateUrl: 'begin-inspection.html',
})
export class BeginInspectionPage {

  quantity: any;
  private itemsArray: any = [];
  private receiveInRecordID: any;
  private userApiToken:any;
  public chckdBoxes: any = [];
  public chckdItems: any = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public recvRecordProvider: ReceiveInRecordsProvider,
              private ref: ChangeDetectorRef,
              public authProvider: AuthProvider,
              public commonProvider: CommonProvider,
              public inspectionProvider: ItemsInspectionProvider,
              public event: Events,
              public zone: NgZone,) {

    let receivedData = this.navParams.get('data');

    // Loader for 1000ms to let load the items list
    let loader = this.commonProvider.presentLoading();
    setTimeout(()=>{
      loader.dismissAll();
    },1000);

    if(receivedData && receivedData != undefined){
      this.receiveInRecordID = receivedData.receive_in_record_id;
    }
    this.authProvider.getLoginUserToken().then((val) => {
      if (val) {
        console.log(val);
        this.userApiToken = val;
        this.getReceiveInRecordItemsDetails();
      }
    });
  }

  // Calling Function from provider to get Receive in Record Items Details
  getReceiveInRecordItemsDetails(){
    if(this.userApiToken && this.userApiToken != undefined) {
      let data = {'receive_in_record_id': this.receiveInRecordID, 'user_api_token': this.userApiToken};
      this.recvRecordProvider.getReceiveInRecordItemsDetails(data).then((res: any) => {
        if (res.status == true) {
          this.itemsArray = [];   // Array for All items
          let itemsDetails = res.data;
          for (let key in itemsDetails) {
            let arr = itemsDetails[key];
            let subItems = [];
            this.chckdBoxes[key+'_box'] = false;    // Array for keeping track of checked Items
            this.chckdItems[key+'_box'] = [];
            for (let i = 0; i < arr.length; i++) {
              subItems.push({'itemId': arr[i].r_item_id, 'inspectionItemId': arr[i].inspection_items_id, 'name' : arr[i].r_item_id});
              this.chckdItems[key+'_box'].push({'itemId': arr[i].r_item_id, 'checked': false, 'description': ''});
            }
            this.itemsArray.push({'items': subItems, 'parentItem': key});
          }
        } else {
          console.log(res.message);
        }
      })
        .catch((err) => {
          console.log(err);
        });
    }
    else{
      console.log('user token missing')
    }
  }

  // Adding New item in DB by receive_in_record_id, parent_item_id.
  // Parameter - parentId of item in which it is added.
  addItem(parentId){
    if(this.userApiToken) {
      let loader  = this.commonProvider.presentLoading();
      let data = {'parent_items_id': parentId, receive_in_records_id: this.receiveInRecordID, 'user_api_token': this.userApiToken}; // Sending parentId of item, receiveinRecord item id
      this.recvRecordProvider.addInspectionItem(data).then((res: any) => {
        loader.dismissAll();
        if (res.status == true) {
          this.getReceiveInRecordItemsDetails();
          this.ref.detectChanges(); // trigger change detection cycle
        } else {
          console.log(res);
        }
      })
        .catch((err) => {
          console.log(err);
        });
    }
    else{
      console.log('user token missing');
    }
  }

  // Function for deleting item from Box when btn clicked
  // Parameters: itemID and inspectionItemID
  deleteItem(itemId, inspectionItemId){
    this.commonProvider.show_delete_confirm('Delete Inspection Item', 'Are you Sure You want to Delete this item?');
    this.event.subscribe('DELETE_CONFIRM',(confirmed)=>{
      this.zone.run(()=>{
        if(confirmed){
          let loader  = this.commonProvider.presentLoading();
          if (this.userApiToken && this.userApiToken != undefined) {
            let data = {'item_id': itemId, inspection_items_id: inspectionItemId, 'user_api_token': this.userApiToken};
            this.recvRecordProvider.deleteInspectionItem(data).then((res: any) => {
              loader.dismissAll();
              console.log('saved items', res);
              if (res.status == true) {
                this.getReceiveInRecordItemsDetails();
                this.ref.detectChanges(); // trigger change detection cycle
              } else {
                console.log(res);
              }
            })
              .catch((err) => {
                console.log(err);
              });
          } else {
            console.log('User token Missing')
          }
        }

      });
    });
  }
  counter(i: number) {
    return new Array(i);
  }


  // Function called when box'scheckbox clicked, it will select or unselect all items in boxes
  // Parameters: parentID
  selectAllItems(parentID){
      if(this.chckdBoxes[parentID+'_box'] == true){
        let items = this.chckdItems[parentID+'_box'];
        for(let i=0;i<items.length;i++){
          this.chckdItems[parentID+'_box'][i].checked = true
        }
        console.log(this.chckdItems);
      }
      else{
        let items = this.chckdItems[parentID+'_box'];
        console.log(items);
        for(let i=0;i<items.length;i++){
          this.chckdItems[parentID+'_box'][i].checked = false;
        }
        console.log(this.chckdItems);
      }
  }

  // Function called when item's checkbox clicked
  // Parameter: index, paretID
  selectOneItem(index, parentID){
    let items = this.chckdItems[parentID+'_box'];
    let checkedVal = this.chckdItems[parentID+'_box'][index].checked;
    console.log(checkedVal);
    let flag = 0;
    for(let i=0;i<items.length;i++){
      if(this.chckdItems[parentID+'_box'][i].checked == checkedVal){
        flag = 1;
      }
      else{
        flag = 0;
        break;
      }
    }
    if(flag){
      this.chckdBoxes[parentID+'_box'] = checkedVal;
    }
    else{
      if(this.chckdBoxes[parentID+'_box'] == true){
        this.chckdBoxes[parentID+'_box'] = false;
      }
    }
    console.log(this.chckdBoxes);
  }


  // Taking seected Items, saving in DB by API.
  // At last Pushing another page for Start Inspection
  inspectItem(){
    let finalItemsArr = [];       // Array to hold selected Items.
    let itemsID = [];             // Array to hold ID's of items selected
    let inspectionItemsId = '0';   // Inspection in case of edit inspection

    for (let key in this.chckdItems) {  // Creating Array of selected Items
      let itemsArr = this.chckdItems[key];
      for(let i=0;i<itemsArr.length;i++){
        if(itemsArr[i].checked == true){
          finalItemsArr.push({'item_id': itemsArr[i].itemId, 'item_name': itemsArr[i].description});  // Array for API
          itemsID.push(itemsArr[i].itemId);
        }
      }
    }

    // If items arr empty.
    if(finalItemsArr.length == 0){
      this.commonProvider.show_basic_prompt('Select Atleast one item for Inspection');
    }
    else{ // Else
      let apiData = {   // Data for API
        'item_ids': itemsID,
        'item_names': finalItemsArr,
        'inspection_items_id': inspectionItemsId,
        'receive_in_records_id': this.receiveInRecordID,
        'user_api_token': ''
      };

      this.authProvider.getLoginUserToken().then((val) => {
        console.log('inProvider', val);
        if (val) {
          apiData.user_api_token = val;
          this.inspectionProvider.saveInspection(apiData).then((res: any)=>{
            console.log('Result Of inspection',res);
            if(res.status == true){
              let newInspectionDetails = res.data;
              if(newInspectionDetails) {
                let data = {'items': finalItemsArr, 'inspectionID': newInspectionDetails['inspection_id'], 'receiveInRecordID': this.receiveInRecordID}; // Data for new Page
                this.navCtrl.push('InspectItemPage', {data: data});  // Pushing new page in stack;
              }
              else{
                this.commonProvider.show_basic_prompt('Something Went Wrong!');
              }
            }
            else{
              this.commonProvider.show_basic_prompt(res.message);
            }
          })
            .catch((err)=>{
              this.commonProvider.show_basic_prompt(err);
            })
        }
      });
      // Calling Function for Saving Inspection
    }
  }

}
