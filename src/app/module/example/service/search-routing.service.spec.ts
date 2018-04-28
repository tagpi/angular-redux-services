import { TestBed, inject } from '@angular/core/testing';

import { SearchRoutingService } from './search-routing.service';

describe('SearchRoutingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchRoutingService]
    });
  });

  it('should be created', inject([SearchRoutingService], (service: SearchRoutingService) => {
    expect(service).toBeTruthy();
  }));
});
