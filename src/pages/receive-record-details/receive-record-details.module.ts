import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceiveRecordDetailsPage } from './receive-record-details';

@NgModule({
  declarations: [
    ReceiveRecordDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceiveRecordDetailsPage),
  ],
})
export class ReceiveRecordDetailsPageModule {}
