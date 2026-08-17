import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseRelatedAffidavitsComponent } from './case-related-affidavits.component';

describe('CaseRelatedAffidavitsComponent', () => {
  let component: CaseRelatedAffidavitsComponent;
  let fixture: ComponentFixture<CaseRelatedAffidavitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseRelatedAffidavitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseRelatedAffidavitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
