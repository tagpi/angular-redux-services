import { TestBed, inject } from '@angular/core/testing';

import { ReduxService } from './redux.service';

describe('ReduxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReduxService]
    });
  });

  it('should be created', inject([ReduxService], (service: ReduxService) => {
    expect(service).toBeTruthy();
  }));
});
