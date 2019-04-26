import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import {HttpClientModule} from "@angular/common/http";

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicStorageModule} from "@ionic/storage";
import { AuthProvider } from '../providers/auth/auth';
import { ConstantsProvider } from '../providers/constants/constants';
import { CommonProvider } from '../providers/common/common';
import { ReceiveInRecordsProvider } from '../providers/receive-in-records/receive-in-records';

import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Transfer } from '@ionic-native/transfer';
import { ImagePicker } from '@ionic-native/image-picker';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import * as ionicGalleryModal from 'ionic-gallery-modal';
import { QRScanner } from '@ionic-native/qr-scanner';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ItemsInspectionProvider } from '../providers/items-inspection/items-inspection';
import { CameraProvider } from '../providers/camera/camera';

import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ionicGalleryModal.GalleryModalModule,
    IonicSelectableModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp,{
      scrollPadding: false,
      scrollAssist: false
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: HAMMER_GESTURE_CONFIG, useClass: ionicGalleryModal.GalleryModalHammerConfig},
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    ConstantsProvider,
    CommonProvider,
    ReceiveInRecordsProvider,
    Camera,
    File,
    FilePath,
    Transfer,
    ImagePicker,
    WebView,
    QRScanner,
    InAppBrowser,
    ItemsInspectionProvider,
    CameraProvider
  ]
})
export class AppModule {}
