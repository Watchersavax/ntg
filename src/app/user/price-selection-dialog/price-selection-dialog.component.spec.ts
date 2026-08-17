import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceSelectionDialogComponent } from './price-selection-dialog.component';

describe('PriceSelectionDialogComponent', () => {
  let component: PriceSelectionDialogComponent;
  let fixture: ComponentFixture<PriceSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceSelectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
