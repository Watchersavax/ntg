import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubcategoryDialogComponent } from './add-subcategory-dialog.component';

describe('AddSubcategoryDialogComponent', () => {
  let component: AddSubcategoryDialogComponent;
  let fixture: ComponentFixture<AddSubcategoryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSubcategoryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubcategoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
