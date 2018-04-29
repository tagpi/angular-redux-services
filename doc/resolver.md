# Using State as Resolver

To create a resolver:

```typescript
@Injectable({ providedIn: 'root' })
export class SearchRoutingService {

  constructor(
    private searchExampleService: SearchExampleService,
    private router: Router) { }

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot)
    : Observable<State> | Promise<State> | State {

      this.searchExampleService.clear();

      if (!activatedRouteSnapshot.params.timeout) {
        setTimeout(() => this.searchExampleService.query('resolve fast'), 2000);
      } else {
        setTimeout(() => this.searchExampleService.query('resolve timeout'), 20000);
      }

      return this.searchExampleService.select()
        .pipe(
          timeout(5000),
          filter(state => !!state.query),

          // note: resolver requires to close the observable to move forward
          take(1),

          // handle timeout
          catchError(reply => {
            console.log('timed out');
            this.router.navigate(['/error', { code: 'itimedout' }]);
            return of({} as State);
          }),

        );

  }

}
```

Notes: 
* you can create the resolver directly on a redux service instance.
