import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetSessionDialogComponent } from './set-session-dialog.component';

describe('SetSessionDialogComponent', () => {
  let component: SetSessionDialogComponent;
  let fixture: ComponentFixture<SetSessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetSessionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
