import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TicketsListPage } from './tickets-list';

@NgModule({
  declarations: [
    TicketsListPage,
  ],
  imports: [
    IonicPageModule.forChild(TicketsListPage),
  ],
})
export class TicketsListPageModule {}
