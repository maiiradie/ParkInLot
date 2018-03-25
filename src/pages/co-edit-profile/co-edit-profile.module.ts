import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoEditProfilePage } from './co-edit-profile';

@NgModule({
  declarations: [
    CoEditProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(CoEditProfilePage),
  ],
})
export class CoEditProfilePageModule {}
