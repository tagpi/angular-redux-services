import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReduxService } from './service/redux.service';
import { RxStatePipe } from './pipe/rx-state.pipe';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ RxStatePipe ],
  exports: [ RxStatePipe ],
})
export class ReduxModule {

}
