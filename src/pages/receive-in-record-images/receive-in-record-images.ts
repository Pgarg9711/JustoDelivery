import {Component, ChangeDetectorRef, ViewChild, NgZone} from '@angular/core';
import {
    ActionSheetController, Content, Events, IonicPage, LoadingController, NavController, NavParams, Platform, Slides, ModalController
} from 'ionic-angular';

import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { CameraOptions, Camera } from "@ionic-native/camera";
import { AuthProvider } from "../../providers/auth/auth";
import { ReceiveInRecordsProvider } from "../../providers/receive-in-records/receive-in-records";
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import {CommonProvider} from "../../providers/common/common";
import { GalleryModal } from 'ionic-gallery-modal';
import {IMG} from "../../providers/constants/constants";

/**
 * Generated class for the ReceiveInRecordImagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
// declare var cordova: any;
@IonicPage()
@Component({
    selector: 'page-receive-in-record-images',
    templateUrl: 'receive-in-record-images.html',
})
export class ReceiveInRecordImagesPage {
    @ViewChild('RIRI') RIRI: Content;   // For Lazy Loading
    @ViewChild('Slider') Slider: Slides;   // For Lazy Loading
    @ViewChild(Slides) slides: Slides;
    defaultImg = IMG.DEFAULT_LOGO;
    BG_IMG = IMG.DEAULT_BG_IMG;
    public uploadedImages:any = [];
    private receive_in_record_data: any;
    private user_api_token: any;
    private data: { receive_in_records_id: number; user_api_token: any };
    public imageLists: any = [];
    public spinnerFlag = false;
    private isAnyUploadedImage: any = true;
    public showSpinner = true;
    loader: any;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private camera: Camera,
                private transfer: Transfer,
                private file: File,
                private filePath: FilePath,
                public platform: Platform,
                private ref: ChangeDetectorRef,
                private authProvider: AuthProvider,
                private rcvRecordProvider: ReceiveInRecordsProvider,
                private imagePicker: ImagePicker,
                private commonProvider: CommonProvider,
                public event: Events,
                public zone: NgZone,
                public modalCtrl: ModalController) {
        // Receive in Record data sent by previous page
        this.receive_in_record_data = this.navParams.get('data');


        // If Receive in Record Data, Getting API token and calling funciton for get saved images
        if(this.receive_in_record_data && this.receive_in_record_data.last_record_id) {
            // API token
            this.authProvider.getLoginUserToken().then((val) => {
                if (val) {
                    this.user_api_token = val;
                    this.data = {
                        'receive_in_records_id': this.receive_in_record_data.last_record_id, 'user_api_token': val
                    };
                    this.getSavedImages(this.data);  // Calling Function for saved images for receive in record id
                }
            });
        }

        this.event.subscribe('JTD_ON_UPLOAD_IMG',(data)=>{      // Subscribing Event Whenever Image uploads fuction to fetch images will be called
            this.zone.run(()=>{
                //get img list
                this.getSavedImages(data);
                this.ref.detectChanges(); // trigger change detection cycle
            });
        });

        // Show spinner to false
        setTimeout(()=>{
            this.showSpinner = false;
        }, 1500);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ReceiveInRecordImagesPage');
        this.slides.freeMode = true;
    }


    // Opening Gallery when click on Image
    openGallery(photos, startIndex){
        let modal = this.modalCtrl.create(GalleryModal, {
            photos: photos,
            initialSlide: startIndex,
        });
        modal.present();
    }

    // Function calling Provider Function for HTTP request to get saved Images.
    // Param - params(user_api_token, receive_in_record_id)
    getSavedImages(params){

        this.uploadedImages = [];
        console.log('params', params);
        if(params) {
            this.rcvRecordProvider.getArrivalRecordImages(params).then((val: any) => {
                if (val) {
                    if (val.status == true) {
                        let res = val.data;
                        if (res.length > 0) {
                            for (let i = res.length-1; i >= 0; i--) {
                                this.uploadedImages.push({name: res[i].image, url: res[i].image_url_formatted});  // Creating An array of Saved Images
                            }
                            console.log('array',this.uploadedImages);
                        }
                        else{
                            this.isAnyUploadedImage = false;
                        }
                    }
                }
            }).catch((err) => {
                this.uploadedImages = [];
                this.commonProvider.show_basic_alert('Error', 'Connection Error, Try Again!');
            });
        }
    }

    // For Selecting multiple Images from Gallery using Image Picker
    // Param: Options of "ImagePickerOptions" type
    loadMultipleImageFromGallery() {
        console.log('sss');
        this.spinnerFlag = false;
        const options: ImagePickerOptions = {
            quality: 100,
            width: 600,
            height: 600,
            maximumImagesCount: 5
        };
        this.imagePicker.getPictures(options).then((results) => {
            for(let i =0; i< results.length; i++){
                if(results[i]) {
                    let newEntry = {
                        name: results[i].substr(results[i].lastIndexOf('/') + 1),
                        path: results[i].substr(0, results[i].lastIndexOf('/') + 1),
                        url: results[i],
                        readFileSrc :  (<any>window).Ionic.WebView.convertFileSrc(results[i])
                    };
                    console.log('URL', newEntry.url);
                    console.log(newEntry.readFileSrc);
                    this.imageLists.push(newEntry);
                }
            }
            console.log("Image List", this.imageLists);
        });
    }

    // For taking Picture using Camera
    // Param: Options of "CameraOptions" type
    takePicture() {
        this.spinnerFlag = false;
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            saveToPhotoAlbum:false,
            correctOrientation: true
        };
        console.log('options', options);
        // Get the data of an image
        this.camera.getPicture(options).then((imagePath) => {

            console.log('PATH', imagePath);
            let file = [{
                'fileTarget'  : imagePath,
                'name'    : imagePath.substr(imagePath.lastIndexOf('/') + 1),
                'path'    : imagePath.substr(0, imagePath.lastIndexOf('/') + 1),
            }];
            // console.log('file', file);
            console.log('file', file[0].fileTarget);
            console.log('file', file[0].name);
            console.log('file', file[0].path);
            if(file){
                this.uploadImage(file, 0);
            }
            else{
                console.log('Image not Found');
            }

        })
            .catch((err)=>{
            console.log(err);
            this.commonProvider.show_basic_prompt('Error while uploading Image.');
        });



        /*this.camera.getPicture(options).then((imagePath) => {

            var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
            var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
            console.log('Uploading');
            let newEntry = {
                name: currentName,
                path: correctPath,
                readFileSrc :  (<any>window).Ionic.WebView.convertFileSrc(imagePath)
            };
            let arr = [newEntry];
            this.uploadImage(arr, 0);
        })
            .catch((err)=>{
                console.log(err);
                this.commonProvider.show_basic_prompt('Error while uploading Image.');
            });*/
    }

    // Delete Image From Selected Image List
    deleteImage(imgEntry, position) {
        console.log('imgEntry', imgEntry);
        console.log('position', position);
        console.log('Image List', this.imageLists);
        this.imageLists.splice(position, 1);
        if(imgEntry && imgEntry != undefined){
            var correctPath = imgEntry.path;
            if(correctPath && correctPath != undefined){
                this.file.removeFile(correctPath, imgEntry.name);
            }
        }
    }

    // Uploading File using "FileTransfer"
    // Param: File Object, flag = 0 for camera, flag = 1 for gallery
    uploadImage(file, flag) {
        let loader = this.commonProvider.presentLoading();
        if(file) {
            console.log('Before Upload', file);
            let totalImgsToUpload = file.length;
            let imgsUploaded = 0;   // Number of Images Uploaded to Server
            let errMsg = '';        // Err String
            let isError = 0;        // If there is Error in Atleast one image upload
            let ii= 1;
            for (let i = 0; i < file.length; i++) {
                var url = "https://crm.justodelivery.com/staging/public/api/v1/save/arrival/images";
                var targetPath = file[i].path + file[i].name;
                var filename = file[i].name;
                console.log('filename', filename);
                var options = {
                    fileKey: "arrival_images",
                    fileName: filename,
                    chunkedMode: false,
                    mimeType: "multipart/form-data",
                    params: {
                        'fileName': filename,
                        'user_api_token': this.user_api_token,
                        'receive_in_records_id': this.receive_in_record_data.last_record_id
                    }
                };

                const fileTransfer: TransferObject = this.transfer.create();
                if (flag == 1) {
                    this.spinnerFlag = true;
                }

                // Use the FileTransfer to upload the image
                fileTransfer.upload(targetPath, url, options).then(data => {

                    console.log('Uploaded Data', data);
                    this.spinnerFlag = false;
                    var response = JSON.parse(data.response);
                    if (response.status == true) {      // If image Uploaded Adding to ImgUploaded Variable
                        imgsUploaded = imgsUploaded + 1;
                        if (flag == 1) {    // images from gallery have to remove
                            this.deleteImage(file[i], i);
                        }
                    }
                    else {
                        isError = 1;
                        errMsg = errMsg + ' ' + response.error;
                    }
                    if(ii==file.length){
                        console.log('after upload', ii);
                        loader.dismissAll();
                        this.performAfterUpload(isError, errMsg, imgsUploaded);
                    }
                    ii++;

                }).catch((err) => {
                    isError = 1;
                    if(ii==file.length){
                        console.log('after upload', ii);
                        loader.dismissAll();
                        this.performAfterUpload(isError, errMsg, imgsUploaded);
                    }
                    ii++;
                    this.spinnerFlag = false;
                    console.log(err);

                });
            }

        }
        else{
            this.commonProvider.show_basic_alert('Image Not Found', 'Select At Least one Image to Upload');
        }
    }

    //Checking For messages
    performAfterUpload(isError, errMsg, imgsUploaded){
        console.log('Perform After Upload');
        this.ref.detectChanges();
        if (isError) {

            this.event.publish('JTD_ON_UPLOAD_IMG', this.data); // Publishing Event
            if (!errMsg) {
                errMsg = ''
            }
            if (imgsUploaded) {
                this.commonProvider.show_basic_alert('' + imgsUploaded + ' Image(s) uploaded Successfully', errMsg);
            } else {
                this.commonProvider.show_basic_alert('Selected Image(s) not Uploaded', errMsg);
            }
        }
        else {
            this.event.publish('JTD_ON_UPLOAD_IMG', this.data); // Publishing Event
            this.commonProvider.show_basic_alert('Success', 'Image(s) uploaded Successfully');
        }
    }
}
