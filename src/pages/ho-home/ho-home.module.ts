import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HoHomePage } from './ho-home';

@NgModule({
  declarations: [
    HoHomePage,
  ],
  imports: [
    IonicPageModule.forChild(HoHomePage),
  ],
})
export class HoHomePageModule {}
