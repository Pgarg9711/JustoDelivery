import { HttpClient } from '@angular/common/http';
import {  Injectable} from '@angular/core';
import { CameraOptions, Camera } from "@ionic-native/camera";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import {CommonProvider} from "../common/common";
import {ImagePicker, ImagePickerOptions} from "@ionic-native/image-picker";
import {ModalController} from "ionic-angular";
import { GalleryModal } from 'ionic-gallery-modal';

/*
  Generated class for the CameraProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CameraProvider {

  imageLists : any;
  constructor(public http: HttpClient,
              public camera: Camera,
              private transfer: FileTransfer,
              private imagePicker: ImagePicker,
              public commonProvider: CommonProvider,
              public modalCtrl: ModalController) {

    console.log('Hello CameraProvider Provider');
  }

  // For taking Picture using Camera
  // Param: url -- to upload image, uploadParams
    takePictureUsingCamera(url, uploadParams, event) {
    // Setting Camera Options
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum:true,
      correctOrientation: true
    };
    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {

      var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
      var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
      if(currentName && correctPath) {
        let newEntry = {
          name: currentName, path: correctPath,
        };
        let arr = [newEntry];
        this.uploadImageToServer(arr, 0, url, uploadParams, event);
      }

    })
      .catch((err)=>{
        console.log(err);
        this.commonProvider.show_basic_prompt(err);
      });
  }


  // Uploading File using "FileTransfer"
  // Param: File Object, flag = 0 for camera, flag = 1 for gallery
  uploadImageToServer(file, flag, url, uploadParams, event) {

    for(let i=0;i<file.length;i++) {    // It will upload Images One By One to Specific URL
      var url = url;
      var targetPath = file[i].path+file[i].name;
      var filename = file[i].name;  // Name of filename
      uploadParams['filename'] = filename;
      var options = {
        fileKey: "images",
        fileName: filename,
        chunkedMode: false,
        mimeType: "multipart/form-data",
        params: uploadParams
      };

      const fileTransfer: FileTransferObject = this.transfer.create();

      // Use the FileTransfer to upload the image
      fileTransfer.upload(targetPath, url, options).then(data => {
        var response = JSON.parse(data.response);
        console.log('Response', response);
        if (response.status == true) {
          console.log(response);

        }
        else {
          this.commonProvider.show_basic_prompt(response.error);
        }
      }, err => {
        console.log(err);
        this.commonProvider.show_basic_prompt('Error while uploading file.');
      });
    }
  }


  // For Selecting multiple Images from Gallery using Image Picker
  // Param: Options of "ImagePickerOptions" type
  loadMultipleImageFromGallery() {
    this.imageLists  = [];
    const options: ImagePickerOptions = {
      quality: 100,
      width: 600,
      height: 600,
      maximumImagesCount: 5
    };
    return this.imagePicker.getPictures(options).then((results) => {
      for(let i =0; i< results.length; i++){
        var currentName = results[i].substr(results[i].lastIndexOf('/') + 1);
        var correctPath = results[i].substr(0, results[i].lastIndexOf('/') + 1);
        let newEntry = {
          name: currentName,
          path: correctPath,
          url: results[i]
        };
        this.imageLists.push(newEntry);
        // this.updateStoredImages(newEntry);
      }
      console.log(this.imageLists);
      return this.imageLists;
    })
      .catch((err)=>{
        console.log(err);
        return err;
      });
  }


  // Opening Gallery when click on Image
  openGallery(photos, startIndex){
    let modal = this.modalCtrl.create(GalleryModal, {
      photos: photos,
      initialSlide: startIndex,
    });
    modal.present();
  }
}
