import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpCentreComponent } from './help-centre.component';

describe('HelpCentreComponent', () => {
  let component: HelpCentreComponent;
  let fixture: ComponentFixture<HelpCentreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpCentreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpCentreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
