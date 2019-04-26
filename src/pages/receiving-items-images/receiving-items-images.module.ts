import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceivingItemsImagesPage } from './receiving-items-images';
import {LazyLoadImageModule} from "ng-lazyload-image";

@NgModule({
  declarations: [
    ReceivingItemsImagesPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceivingItemsImagesPage),
    LazyLoadImageModule
  ],
})
export class ReceivingItemsImagesPageModule {}
