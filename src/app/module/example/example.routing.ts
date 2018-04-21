import { RouterModule } from '@angular/router';
import { IndexComponent } from './view/index/index.component';

export const routing = RouterModule.forChild([
  { path: '', component: IndexComponent, pathMatch: 'full' },
]);
