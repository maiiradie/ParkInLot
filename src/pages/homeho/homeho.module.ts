import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomehoPage } from './homeho';

@NgModule({
  declarations: [
    HomehoPage,
  ],
  imports: [
    IonicPageModule.forChild(HomehoPage),
  ],
})
export class HomehoPageModule {}
