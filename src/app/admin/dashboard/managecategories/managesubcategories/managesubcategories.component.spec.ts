import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagesubcategoriesComponent } from './managesubcategories.component';

describe('ManagesubcategoriesComponent', () => {
  let component: ManagesubcategoriesComponent;
  let fixture: ComponentFixture<ManagesubcategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagesubcategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagesubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
