import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InspectItemPage } from './inspect-item';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    InspectItemPage,
  ],
  imports: [
    IonicPageModule.forChild(InspectItemPage),
    IonicSelectableModule
  ],
})
export class InspectItemPageModule {}
