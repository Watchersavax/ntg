import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMeetingDialogComponent } from './schedule-meeting-dialog.component';

describe('ScheduleMeetingDialogComponent', () => {
  let component: ScheduleMeetingDialogComponent;
  let fixture: ComponentFixture<ScheduleMeetingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleMeetingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
