import {ChangeDetectorRef, Component, NgZone, ViewChild} from '@angular/core';
import {Content, Events, IonicPage, NavController, NavParams, Slides} from 'ionic-angular';
import {CameraProvider} from "../../providers/camera/camera";
import {CommonProvider} from "../../providers/common/common";
import { File } from '@ionic-native/file';
import {ItemsInspectionProvider} from "../../providers/items-inspection/items-inspection";
import {AuthProvider} from "../../providers/auth/auth";
import {IMG} from "../../providers/constants/constants";

/**
 * Generated class for the ReceivingItemsImagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-receiving-items-images',
    templateUrl: 'receiving-items-images.html',
})
export class ReceivingItemsImagesPage {
    @ViewChild('IIMG') IIMG: Content;   // For Lazy Loading
    @ViewChild('Slider') Slider: Slides;   // For Lazy Loading
    @ViewChild(Slides) slides: Slides;
    defaultImg = IMG.DEFAULT_LOGO;

    finalImagesList:any = [];
    user_api_token = '';
    savedItemImages = [];
    private inspectionID : any;
    private itemID: any;
    public EVENT = ''; // To hold the name of Event

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public cameraProvider: CameraProvider,
                public commonProvider: CommonProvider,
                private authProvider: AuthProvider,
                private file: File,
                public event: Events,
                public zone: NgZone,
                private ref: ChangeDetectorRef,
                public inspectionProvider: ItemsInspectionProvider) {

        let receivedData = this.navParams.get('data');  // Getting data sent by previous page
        this.EVENT = 'ITEM_IMG_UPLOADED';
        if(receivedData) {
            this.inspectionID = receivedData.itemID;  // Array of items for inspection
            this.itemID = receivedData.inspectionID; // Receinve in Record ID

            this.authProvider.getLoginUserToken().then((val) => {
                if (val) {
                    this.user_api_token = val;
                    let data = {
                        'inspection_items_id': this.inspectionID, 'receive_in_items_id': this.itemID, 'user_api_token': val
                    };
                    this.getSavedImages(data);  // Calling Function for saved images for receive in record id
                }
                else {
                    this.authProvider.logout();
                }
            });
        }

        this.event.subscribe(this.EVENT,(data)=>{      // Subscribing Event Whenever Image uploads fuction to fetch images will be called
            this.zone.run(()=>{
                //get img list
                this.getSavedImages(data);
                this.ref.detectChanges(); // trigger change detection cycle
            });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ReceivingItemsImagesPage');
    }



    // Function For fetching Saved images
    getSavedImages(data){
        console.log('get_images_func called');
        if(data){
            this.inspectionProvider.getInspectionItemImages(data).then((val: any)=>{
                console.log('func calld');
                console.log(val);
                if (val.status == true) {
                    let res = val.data;
                    console.log('val st true');
                    if (res.length > 0) {
                        for (let i = res.length-1; i >= 0; i--) {
                            this.savedItemImages.push({name: res[i].image, url: res[i].image_url_formatted});  // Creating An array of Saved Images
                        }
                        console.log('array',this.savedItemImages);
                    }
                }
            }).catch((err) => {
                this.commonProvider.show_basic_alert('Error', 'Something went Wrong!, Unable to fetch saved images');
            });
        }
        else{
            this.commonProvider.show_basic_prompt('Missing Arguments');
        }
    }

    // For taking Picture using Camera
    // Param: Options of "CameraOptions" type
    takePictureByCamera() {
        // this.spinnerFlag = false;
        let url = 'https://crm.justodelivery.com/staging/public/api/v1/save/receiving/items/images';
        let params =  {
            'user_api_token': this.user_api_token,
            'img_inspection_items_id':this.inspectionID,
            'img_items_id': this.itemID
        }
        // Calling Function from Camera Provider to open camera, take pic and Upload to url
        this.cameraProvider.takePictureUsingCamera(url, params, this.EVENT);
    }

    uploadImage(finalImagesList, flag){
        let url = 'https://crm.justodelivery.com/staging/public/api/v1/save/receiving/items/images';
        let params =  {
            'user_api_token': this.user_api_token,
            'img_inspection_items_id':this.inspectionID,
            'img_items_id': this.itemID
        }
        this.cameraProvider.uploadImageToServer(finalImagesList, flag, url, params, this.EVENT);
    }

    // For taking Picture from Gallery
    selectImageFromGallery(){
        this.cameraProvider.loadMultipleImageFromGallery().then((selectedImages)=>{
            if(selectedImages && selectedImages.length){
                for(let i=0;i<selectedImages.length;i++){
                    this.finalImagesList.push(selectedImages[i]);
                }
                console.log(this.finalImagesList);
            }
            else{
                this.commonProvider.show_basic_prompt('Please select atleast one image');
            }

        });
    }

    // Delete Image From Selected Image List
    deleteImage(imgEntry, position) {
        console.log('imgEntry', imgEntry);
        console.log('position', position);
        console.log('Image List', this.finalImagesList);
        this.finalImagesList.splice(position, 1);
        if(imgEntry && imgEntry != undefined){
            var correctPath = imgEntry.path;
            if(correctPath && correctPath != undefined){
                this.file.removeFile(correctPath, imgEntry.name);
            }
        }
    }

    // Opening Gallery View for Images
    openGallery(photos, startIndex){
        this.cameraProvider.openGallery(photos, startIndex);
    }
}
