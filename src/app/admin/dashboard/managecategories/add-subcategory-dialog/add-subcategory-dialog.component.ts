import { Component, Inject, OnInit } from '@angular/core';
import { CategoriesService } from '../categories.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-add-subcategory-dialog',
  templateUrl: './add-subcategory-dialog.component.html',
  styleUrls: ['./add-subcategory-dialog.component.css']
})
export class AddSubcategoryDialogComponent implements OnInit {

  templateSubCategoryName: string = "";
  editFlag: boolean = false;
  errorFlag: boolean = false;

  constructor(
    private categoriesService: CategoriesService,
    public dialogRef: MatDialogRef<AddSubcategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public subcategory: any
  ) {}

  ngOnInit(): void {
    if (this.subcategory.data.edit) {
      const data = this.subcategory.data;
      this.templateSubCategoryName = data.templateSubCategoryName;
      this.editFlag = true;
    }
  }

  createSubCategory() {
    if(!this.templateSubCategoryName ) {
      this.errorFlag = true;
      return
    }
    this.errorFlag = false;
    this.categoriesService
      .addSubCategory(
        {
          templateSubCategoryName: this.templateSubCategoryName,
          templateCategoryId: this.subcategory.data.templateCategoryId,
          active: true
        },
      )
      .subscribe((response: any) => {
        this.dialogRef.close();
      });
  }

  editSubCategory() {
    if(!this.templateSubCategoryName ) {
      this.errorFlag = true;
      return
    }
    this.errorFlag = false;
    
    this.categoriesService
      .addSubCategory(
        {
          templateSubCategoryName: this.templateSubCategoryName,
          templateSubCategoryId: this.subcategory.data.templateSubCategoryId,
          templateCategoryId: this.subcategory.data.templateCategoryId,
          active: this.subcategory.data.active
        },
      )
      .subscribe((response: any) => {
        this.dialogRef.close();
      });
  }

  close() {
    this.dialogRef.close();
  }

}
