import { RouterModule } from '@angular/router';
import { IndexComponent } from './view/index/index.component';
import { RouterTestComponent } from './view/router-test/router-test.component';
import { SearchRoutingService } from './service/search-routing.service';

export const routing = RouterModule.forChild([
  { path: '', component: IndexComponent, pathMatch: 'full' },
  {
    path: 'router',
    component: RouterTestComponent,
    resolve: {
      search: SearchRoutingService
    }
  },
]);
