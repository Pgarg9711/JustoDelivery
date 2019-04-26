import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceiveInRecordImagesPage } from './receive-in-record-images';
import {LazyLoadImageModule} from "ng-lazyload-image";

@NgModule({
  declarations: [
    ReceiveInRecordImagesPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceiveInRecordImagesPage),
    LazyLoadImageModule
  ],
})
export class ReceiveInRecordImagesPageModule {}
