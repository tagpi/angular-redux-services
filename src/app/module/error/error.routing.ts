import { RouterModule } from '@angular/router';
import { ErrorComponent } from './view/error/error.component';

export const routing = RouterModule.forChild([
  { path: '', component: ErrorComponent, pathMatch: 'full' },
]);
