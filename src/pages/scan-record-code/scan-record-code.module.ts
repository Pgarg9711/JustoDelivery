import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScanRecordCodePage } from './scan-record-code';

@NgModule({
  declarations: [
    ScanRecordCodePage,
  ],
  imports: [
    IonicPageModule.forChild(ScanRecordCodePage),
  ],
})
export class ScanRecordCodePageModule {}
