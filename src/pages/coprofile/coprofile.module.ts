import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoprofilePage } from './coprofile';

@NgModule({
  declarations: [
    CoprofilePage,
  ],
  imports: [
    IonicPageModule.forChild(CoprofilePage),
  ],
})
export class CoprofilePageModule {}
