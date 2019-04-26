import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceiveInRecordsPage } from './receive-in-records';
import {LazyLoadImageModule} from "ng-lazyload-image";

@NgModule({
  declarations: [
    ReceiveInRecordsPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceiveInRecordsPage), LazyLoadImageModule
  ],
})
export class ReceiveInRecordsPageModule {}
