import { TestBed } from '@angular/core/testing';

import { CourtDashboardService } from './court-dashboard.service';

describe('CourtDashboardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CourtDashboardService = TestBed.get(CourtDashboardService);
    expect(service).toBeTruthy();
  });
});
