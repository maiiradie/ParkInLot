import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HoEditProfilePage } from './ho-edit-profile';

@NgModule({
  declarations: [
    HoEditProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(HoEditProfilePage),
  ],
})
export class HoEditProfilePageModule {}
