import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReduxService } from './module/redux/service/redux.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'app';


}
