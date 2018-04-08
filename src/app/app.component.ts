import { Component } from '@angular/core';
import { ReduxService } from './module/redux/service/redux.service';
import 'rxjs/add/observable/timer';
import { SearchExampleService } from './module/example/service/search-example.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(
    public reduxService: ReduxService,
    public searchExampleService: SearchExampleService) {

  }

}
