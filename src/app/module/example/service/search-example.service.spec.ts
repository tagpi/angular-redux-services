import { TestBed, inject } from '@angular/core/testing';

import { SearchExampleService } from './search-example.service';

describe('SearchExampleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchExampleService]
    });
  });

  it('should be created', inject([SearchExampleService], (service: SearchExampleService) => {
    expect(service).toBeTruthy();
  }));
});
