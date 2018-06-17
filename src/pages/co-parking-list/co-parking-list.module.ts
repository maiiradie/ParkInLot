import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoParkingListPage } from './co-parking-list';

@NgModule({
  declarations: [
    CoParkingListPage,
  ],
  imports: [
    IonicPageModule.forChild(CoParkingListPage),
  ],
})
export class CoParkingListPageModule {}
