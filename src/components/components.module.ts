import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { Timer } from './countdown-timer/timer';
export const components = [
	Timer,
  ];
@NgModule({
	declarations: [Timer],
	imports: [],
	exports: [Timer]
})
export class ComponentsModule {}
