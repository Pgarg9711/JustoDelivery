import {ChangeDetectorRef, Component, NgZone} from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {ReceiveInRecordsProvider} from "../../providers/receive-in-records/receive-in-records";
import {AuthProvider} from "../../providers/auth/auth";
import {CommonProvider} from "../../providers/common/common";
import {ItemsInspectionProvider} from "../../providers/items-inspection/items-inspection";
import {
    DEFECTIVE_STATUS, DEFECTIVE_STATUS_FORMATTED, RECEIVE_IN_STATUS, RECEIVE_IN_STATUS_FORMATTED
} from "../../providers/constants/constants";

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
    itemsArray: any = [];
    receiveInRecordID ='';
    receiveInRecordDetails = '';
    inspectionItemsID ='0';
    userApiToken:any;
    chckdBoxes: any = [];
    chckdItems: any = [];
    itemLeftForInspection = true;   // if there are items remain for inspection,, by default setting value to true

    pageTitle = 'Create Inspection';

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public recvRecordProvider: ReceiveInRecordsProvider,
                private ref: ChangeDetectorRef,
                public authProvider: AuthProvider,
                public commonProvider: CommonProvider,
                public inspectionProvider: ItemsInspectionProvider,
                public event: Events,
                public zone: NgZone,) {
    }

    ionViewDidEnter(){
        let receivedData = this.navParams.get('data');
        // Loader for 1000ms to let load the items list
        let loader = this.commonProvider.presentLoading();
        setTimeout(()=>{
            loader.dismissAll();
        },1000);

        if(receivedData){       // Receive in Record ID and inspectionItemsID sent By Previous page
            this.receiveInRecordID = receivedData.receiveInRecordID;
            this.inspectionItemsID = receivedData.inspectionItemsID;    // ID will not null only in case of edit Inspection
            this.receiveInRecordDetails = receivedData.receiveInRecordDetails;
        }
        this.authProvider.getLoginUserToken().then((val) => {
            if (val) {                  // Getting Token of Logged in User
                console.log(val);
                this.userApiToken = val;
                this.getReceiveInRecordItemsDetails();      // Calling function to get Items
            }
            else{       // Logging Out if User TOken not Defined
                this.authProvider.logout();
            }
        });

        let nextPageData = this.navParams.get('dataFromNextPage');
        if(nextPageData){
            this.inspectionItemsID = nextPageData.inspectionID;
            console.log(this.inspectionItemsID);
        }

        if(this.inspectionItemsID){
            this.pageTitle = 'Edit Inspection';
        }
        else{
            this.pageTitle = "Create Inspection"
        }
    }

    // Checking Status of Items in Inspection
    isItemInspectionCompleted(boxIndex, itemIndex){

        let items = this.itemsArray[boxIndex].items;
        let status = items[itemIndex].itemStatusFormatted;
        let defectiveStatus = items[itemIndex].itemDefectiveStatusFormatted;

        if(status == RECEIVE_IN_STATUS_FORMATTED.INSPECTION_DONE ||
            (status == RECEIVE_IN_STATUS_FORMATTED.INSPECTION_DEFECTIVE && defectiveStatus == DEFECTIVE_STATUS_FORMATTED.REPAIRED)||
            (status == RECEIVE_IN_STATUS_FORMATTED.INSPECTION_DEFECTIVE && defectiveStatus == DEFECTIVE_STATUS_FORMATTED.REPLACED))
        {
            return true;
        }
        else{
            return false;
        }
    }
    // Calling Function from provider to get Receive in Record Items Details
    getReceiveInRecordItemsDetails(){
        if(this.userApiToken && this.receiveInRecordID) {
            let data = {'receive_in_record_id': this.receiveInRecordID, 'user_api_token': this.userApiToken};
            this.recvRecordProvider.getReceiveInRecordItemsDetails(data).then((res: any) => {
                console.log('RES', res);
                if (res.status == true) {
                    this.itemsArray = [];   // Array for All items
                    let itemsDetails = res.data;
                    console.log('ITEM _ DETAILS', itemsDetails);
                    let skipBox = true;
                    let totalBoxesSkipped = 0;
                    let skipItem = true;
                    for (let key in itemsDetails) {
                        let totalItemsSkipped = 0;
                        let itemsNotInInspection = 0;
                        let arr = itemsDetails[key];
                        let subItems = [];
                        this.chckdItems[key+'_box'] = [];
                        for (let i = 0; i < arr.length; i++) {
                            let checked = false;
                            if(arr[i].inspection_items_id == null){ // Showing items that are not in inspection
                                skipItem = false;
                                itemsNotInInspection ++;
                            }
                            else{
                                if(this.inspectionItemsID && arr[i].inspection_items_id == this.inspectionItemsID){ // in case of edit showing item of same inspection ID
                                    skipItem = false;
                                    checked = true;
                                }
                                else{   // Skipping items in inspection
                                    skipItem = true;
                                    totalItemsSkipped++;       // Counting Total Items skipped from Box
                                }
                            }

                            let defectiveSt = '';
                            if(arr[i].item_status_formatted == RECEIVE_IN_STATUS_FORMATTED.INSPECTION_DEFECTIVE){
                                defectiveSt = arr[i].item_defective_status_formatted;
                            }

                            subItems.push({
                                'itemId': arr[i].r_item_id,
                                'inspectionItemId': arr[i].inspection_items_id,
                                'name' : arr[i].item_name,
                                'itemStatusFormatted': arr[i].item_status_formatted,
                                'itemDefectiveStatusFormatted': defectiveSt,
                                'skipItem': skipItem
                            });
                            this.chckdItems[key + '_box'].push({
                                'itemId': arr[i].r_item_id,
                                'checked': checked,
                                'description': arr[i].item_name,
                                'skipItem': skipItem,
                                'itemStatusFormatted': arr[i].item_status_formatted,
                                'itemDefectiveStatusFormatted': defectiveSt,
                                'notes': arr[i].notes,
                                'rackName': arr[i].rack_name,
                                'rackID': arr[i].racks_id,
                            });


                        }
                        if(totalItemsSkipped == arr.length){    // Skipping Box if there is no Item in that Box
                            skipBox = true;
                            totalBoxesSkipped++;
                        }
                        else{
                            skipBox = false;
                            if(itemsNotInInspection){   // if itemNotInInspection greater than zero
                                this.chckdBoxes[key+'_box'] = false;    // Array for keeping track of checked Boxes
                            }
                            else{   // if there is no item in inspection then marking box as checked because remaining item will belong to its inspection
                                this.chckdBoxes[key+'_box'] = true;    // Array for keeping track of checked Boxes
                            }

                        }
                        this.itemsArray.push({'items': subItems, 'parentItem': key, 'skipBox': skipBox});
                    }
                    if(totalBoxesSkipped == Object.keys(itemsDetails).length){
                        this.itemLeftForInspection = false;
                    }
                }
                else {
                    console.log(res.message);
                }
            })
            .catch((err) => {
                console.log(err);
            });
        }
        else{
            console.log('Missing Arguments')
        }
    }

    // Adding New item in DB by receive_in_record_id, parent_item_id.
    // Parameter - parentId of item in which it is added.
    addItem(parentId, index){
        if(this.userApiToken) {
            let loader  = this.commonProvider.presentLoading();
            let data = {'parent_items_id': parentId, receive_in_records_id: this.receiveInRecordID, 'user_api_token': this.userApiToken}; // Sending parentId of item, receiveinRecord item id
            this.recvRecordProvider.addInspectionItem(data).then((res: any) => {
                loader.dismissAll();
                if (res.status == true) {
                    this.itemsArray[index].items.push({         // Adding New Item to Arrays after success save
                        'itemId': res.data,
                        'inspectionItemId': null,
                        'name' : null,
                        'itemStatusFormatted': RECEIVE_IN_STATUS_FORMATTED.INSPECTION_PENDING,
                        'itemDefectiveStatusFormatted': '',
                        'skipItem': false
                    });
                    this.chckdItems[parentId + '_box'].push({
                        'itemId':  res.data,
                        'checked': false,
                        'description': null,
                        'skipItem': false,
                        'itemStatusFormatted': RECEIVE_IN_STATUS_FORMATTED.INSPECTION_PENDING,
                        'itemDefectiveStatusFormatted': '',
                        'notes': null,
                        'rackName': null,
                        'rackID': null,
                    });
                    this.chckdBoxes[parentId+'_box'] = false;
                    this.ref.detectChanges(); // trigger change detection cycle
                } else {
                    this.commonProvider.show_basic_alert('Error', res.message);
                }
            })
            .catch((err) => {
                this.commonProvider.show_basic_alert('Error', 'Something Went Wrong!');
            });
        }
        else{
            console.log('user token missing');
        }
    }

    // Function for deleting item from Box when btn clicked
    // Parameters: itemID and inspectionItemID, boxIndex, ItemIndex
    deleteItem(itemId, inspectionItemId, boxIndex, itemIndex){
        this.commonProvider.show_delete_confirm('Delete Inspection Item', 'Are you Sure You want to Delete this item?').then((re)=>{
            console.log('sd',re)
            let loader  = this.commonProvider.presentLoading();
            if (this.userApiToken && this.userApiToken != undefined) {
                if(itemId) {
                    let data = {
                        'item_id': itemId,
                        inspection_items_id: inspectionItemId,
                        'user_api_token': this.userApiToken
                    };
                    this.recvRecordProvider.deleteInspectionItem(data).then((res: any) => {
                        console.log('ff');
                        loader.dismissAll();
                        if (res.status == true) {
                            let parentItemId = this.itemsArray[boxIndex].parentItem;
                            this.itemsArray[boxIndex].items.splice(itemIndex, 1);       // Removing Item from Box
                            this.chckdItems[parentItemId + '_box'].splice(itemIndex, 1);    // Removing Item from Box
                            if (this.itemsArray[boxIndex].items.length == 0) {
                                this.itemsArray[boxIndex].skipBox = true;       // Skipping Box if not item remain in box
                            } else {
                                if (parentItemId == itemId) {   // If Parent Item Deleted
                                    let newParentItemID = res.data.new_parent_items_id;
                                    if(newParentItemID) {
                                        this.itemsArray[boxIndex].parentItem = newParentItemID; // Changing parent item for items Array
                                        let boxToRemove = this.chckdItems[parentItemId + '_box'];   // Removing box of Old Parent item ID
                                        this.chckdItems[newParentItemID + '_box'] = boxToRemove;
                                        delete this.chckdItems[parentItemId + '_box'];
                                    }
                                }
                            }
                            this.ref.detectChanges(); // trigger change detection cycle
                        } else {
                            this.commonProvider.show_basic_alert('Error', res.message);
                        }
                    })
                        .catch((err) => {
                            this.commonProvider.show_basic_alert('Error', 'Something Went Wrong!');
                        });
                }
            } else {
                console.log('User token Missing')
            }
        }).catch((e)=>{console.log(e)});
    }

    counter(i: number) {
        return new Array(i);
    }


    // Function called when box'scheckbox clicked, it will select or unselect all items in boxes
    // Parameters: parentID
    selectAllItems(parentID){
        console.log('select all clickd');
        if(this.chckdBoxes[parentID+'_box'] == true){
            let items = this.chckdItems[parentID+'_box'];
            for(let i=0;i<items.length;i++){
                if(items[i].skipItem == false) {
                    this.chckdItems[parentID + '_box'][i].checked = true;
                }
            }
            console.log(this.chckdItems);
        }
        else{
            let items = this.chckdItems[parentID+'_box'];
            console.log(items);
            for(let i=0;i<items.length;i++){
                if(items[i].skipItem == false) {
                    this.chckdItems[parentID + '_box'][i].checked = false;
                }
            }
            console.log(this.chckdItems);
        }
    }

    // Function called when item's checkbox clicked
    // Parameter: index, paretID
    selectOneItem(index, parentID){
        console.log('selecrt one item called');
        let items = this.chckdItems[parentID+'_box'];
        let checkedVal = this.chckdItems[parentID+'_box'][index].checked;
        console.log(checkedVal);
        let flag = 0;
        for(let i=0;i<items.length;i++){
            if(this.chckdItems[parentID + '_box'][i].skipItem == false) {
                if (this.chckdItems[parentID + '_box'][i].checked == checkedVal) {
                    flag = 1;
                } else {
                    flag = 0;
                    break;
                }
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
        let itemDetailsArr = [];
       // let inspectionItemsId = '0';   // Inspection in case of edit inspection
        for (let key in this.chckdItems) {  // Creating Array of selected Items
            let itemsArr = this.chckdItems[key];
            for(let i=0;i<itemsArr.length;i++){
                if(itemsArr[i].checked == true){
                    finalItemsArr.push({'item_id': itemsArr[i].itemId, 'item_name': itemsArr[i].description});  // Array for API
                    itemsID.push(itemsArr[i].itemId);
                    itemDetailsArr.push(itemsArr[i]);
                }
            }
        }
        console.log(this.chckdItems);

        // If items arr empty.
        if(finalItemsArr.length == 0){
            this.commonProvider.show_basic_prompt('Select Atleast one item for Inspection');
        }
        else{ // Else
            let apiData = {   // Data for API
                'item_ids': itemsID,
                'item_names': finalItemsArr,
                'inspection_items_id': this.inspectionItemsID,
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

                            if(newInspectionDetails){
                                this.inspectionItemsID = newInspectionDetails['inspection_items_id'];
                                let data = {
                                    'items': finalItemsArr,
                                    'itemDetailsArr': itemDetailsArr,
                                    'inspectionID': newInspectionDetails['inspection_items_id'],
                                    'receiveInRecordDetails': this.receiveInRecordDetails
                                }; // Data for new Page
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
