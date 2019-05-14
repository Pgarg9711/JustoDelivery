import {ChangeDetectorRef, Component, NgZone, ViewChild} from '@angular/core';
import {Content, Events, IonicPage, ModalController, NavController, NavParams, Platform, Slides} from 'ionic-angular';

import {File} from '@ionic-native/file';
import {FileTransfer, FileTransferObject, FileUploadOptions} from '@ionic-native/file-transfer';
import {FilePath} from '@ionic-native/file-path';
import {Camera, CameraOptions} from "@ionic-native/camera";
import {AuthProvider} from "../../providers/auth/auth";
import {ReceiveInRecordsProvider} from "../../providers/receive-in-records/receive-in-records";
import {ImagePicker, ImagePickerOptions} from '@ionic-native/image-picker';
import {CommonProvider} from "../../providers/common/common";
import {GalleryModal} from 'ionic-gallery-modal';
import {IMG, SITE_URLS} from "../../providers/constants/constants";

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
                private transfer: FileTransfer,
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
        // this.receive_in_record_data = this.navParams.get('data');

        this.receive_in_record_data = {
            last_record_id: 409
        };

        // If Receive in Record Data, Getting API token and calling funciton for get saved images
        // && this.receive_in_record_data.last_record_id -- insert in if
        if(this.receive_in_record_data) {
            // API token
            this.authProvider.getLoginUserToken().then((val) => {
                if (val) {
                    this.user_api_token = val;
                    this.data = {
                        'receive_in_records_id': 409, 'user_api_token': val
                    };
                    this.getSavedImages(this.data);  // Calling Function for saved images for receive in record id
                }
            });

        }

        this.event.subscribe('JTD_ON_UPLOAD_IMG',(data)=>{// Subscribing Event Whenever Image uploads fuction to fetch images will be called
            console.log('event published');
            this.zone.run(()=>{
                //get img list
                console.log('event data', data);
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
                            console.log('res length',res);
                            if(!this.uploadedImages.length){
                                for (let i = res.length-1; i >= 0; i--) {
                                    this.uploadedImages.push({name: res[i].image, url: res[i].image_url_formatted});  // Creating An array of Saved Images
                                }
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
        console.log(this.imageLists.length);
        if(this.imageLists.length < 5) {

            let maxCount = 5 - this.imageLists.length;
            console.log('sss');
            this.spinnerFlag = false;
            const options: ImagePickerOptions = {
                quality: 100, width: 600, height: 600, maximumImagesCount: maxCount
            };
            this.imagePicker.getPictures(options).then((results) => {
                for (let i = 0; i < results.length; i++) {
                    if (results[i]) {
                        let newEntry = {
                            name: results[i].substr(results[i].lastIndexOf('/') + 1),
                            path: results[i].substr(0, results[i].lastIndexOf('/') + 1),
                            url: results[i],
                            readFileSrc: (<any>window).Ionic.WebView.convertFileSrc(results[i]),
                            spinner: false,
                            id: 'upload_btn_'+results[i].substr(results[i].lastIndexOf('/') + 1),
                        };
                        console.log('URL', newEntry.url);
                        console.log(newEntry.readFileSrc);
                        if (newEntry.path && newEntry.name) {
                            this.imageLists.push(newEntry);
                        }
                    }
                }
                console.log("Image List", this.imageLists);
            });
        }
        else{
            this.commonProvider.show_basic_prompt('Can\'t Select more than 5 Images.');
        }
    }


    uploadAllImages(images){
        console.log('images', images);
        let i=0;
        this.uploadImage(images[i], 1).then((res:any)=>{
            if(res){
                console.log('Image Uplaoded', res);
                if(i<images.length){
                    this.uploadAllImages(images);
                }
                i++;
            }


        }).catch(e=>console.log(e));
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
            saveToPhotoAlbum:true,
            correctOrientation: true
        };
        this.camera.getPicture(options).then((imagePath) => {
            let file = [{
                fileTarget  : imagePath,
                name    : imagePath.substr(imagePath.lastIndexOf('/') + 1),
                path    : imagePath.substr(0, imagePath.lastIndexOf('/') + 1),
                readFileSrc :  (<any>window).Ionic.WebView.convertFileSrc(imagePath),
                spinner : false,
                id: 'upload_btn_'+imagePath.substr(imagePath.lastIndexOf('/') + 1),
            }];
            console.log('file', file[0].readFileSrc);
            console.log('file', file[0].fileTarget);
            console.log('file', file[0].name);
            console.log('file', file[0].path);

            if(file.length){

                this.imageLists.push(file[0]);
                // this.uploadImage(file[0], 0).then((res: any)=>{
                //     if(res){
                //         this.commonProvider.show_basic_alert('Success','Image Uploaded Successfully');
                //     }
                // });
            } else{
                console.log('Image not Found');
            }
        }).catch(()=>{});
    }

    // Delete Image From Selected Image List
    deleteImage(imgEntry, position) {
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
        return new Promise(resolve => {
                console.log(file);
                file.spinner = true;
                var url = SITE_URLS.API_URL+SITE_URLS.VERSION+"/save/arrival/images";
                var targetPath = file.path + file.name;
                var filename = file.name;
                let options: FileUploadOptions = {
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
                const fileTransfer: FileTransferObject = this.transfer.create();
                fileTransfer.upload(targetPath, url, options).then(data => {
                    var response = JSON.parse(data.response);
                    console.log('Response', response);
                    if (response.status == true) {      // If image Uploaded Adding to ImgUploaded Variable
                        if (flag == 1) {    // images from gallery have to remove
                            this.deleteImage(file, 0);
                        }
                        // this.event.publish('JTD_ON_UPLOAD_IMG', this.data);
                        this.getSavedImages(this.data);
                    } else {
                        file.spinner = false;
                        // this.getSavedImages(this.data);

                    }

                    return resolve(response);
                }).catch((err) => {
                    file.spinner = false;
                    return resolve(err);
                });
            });
    }

}
