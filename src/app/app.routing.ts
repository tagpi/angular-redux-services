import { Routes, RouterModule } from '@angular/router';

export const routing =
  RouterModule.forRoot([
    // ...routes,
    { path: 'error', loadChildren: './module/error/error.module#ErrorModule' },
    { path: 'example', loadChildren: './module/example/example.module#ExampleModule' },
  ]);
