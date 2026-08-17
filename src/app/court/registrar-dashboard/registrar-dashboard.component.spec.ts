import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarDashboardComponent } from './registrar-dashboard.component';

describe('RegistrarDashboardComponent', () => {
  let component: RegistrarDashboardComponent;
  let fixture: ComponentFixture<RegistrarDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
