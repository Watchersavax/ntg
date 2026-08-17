import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendlyAppointmentDialogComponent } from './calendly-appointment-dialog.component';

describe('CalendlyAppointmentDialogComponent', () => {
  let component: CalendlyAppointmentDialogComponent;
  let fixture: ComponentFixture<CalendlyAppointmentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendlyAppointmentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendlyAppointmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
