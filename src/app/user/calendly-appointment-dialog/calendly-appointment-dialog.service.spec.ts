import { TestBed } from '@angular/core/testing';

import { CalendlyAppointmentDialogService } from './calendly-appointment-dialog.service';

describe('CalendlyAppointmentDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalendlyAppointmentDialogService = TestBed.get(CalendlyAppointmentDialogService);
    expect(service).toBeTruthy();
  });
});
