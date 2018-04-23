import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstHomePage } from './est-home';

@NgModule({
  declarations: [
    EstHomePage,
  ],
  imports: [
    IonicPageModule.forChild(EstHomePage),
  ],
})
export class EstHomePageModule {}
