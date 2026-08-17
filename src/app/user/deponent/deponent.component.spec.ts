import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeponentComponent } from './deponent.component';

describe('DeponentComponent', () => {
  let component: DeponentComponent;
  let fixture: ComponentFixture<DeponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
