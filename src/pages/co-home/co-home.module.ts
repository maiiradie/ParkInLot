import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoHomePage } from './co-home';

@NgModule({
  declarations: [
    CoHomePage,
  ],
  imports: [
    IonicPageModule.forChild(CoHomePage)
  ],
})
export class CoHomePageModule {}
