import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HoTransacHistoryPage } from './ho-transac-history';

@NgModule({
  declarations: [
    HoTransacHistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(HoTransacHistoryPage),
  ],
})
export class HoTransacHistoryPageModule {}
