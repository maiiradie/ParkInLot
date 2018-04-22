import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstProfilePage } from './est-profile';

@NgModule({
  declarations: [
    EstProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(EstProfilePage),
  ],
})
export class EstProfilePageModule {}
