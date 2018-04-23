import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstEditProfilePage } from './est-edit-profile';

@NgModule({
  declarations: [
    EstEditProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(EstEditProfilePage),
  ],
})
export class EstEditProfilePageModule {}
