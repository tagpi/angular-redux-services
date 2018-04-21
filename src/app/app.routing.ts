import { Routes, RouterModule } from '@angular/router';

export const routing =
  RouterModule.forRoot([
    // ...routes,
    { path: 'example', loadChildren: './module/example/example.module#ExampleModule' },
  ]);
