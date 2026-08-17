import { Component, Inject, OnInit } from '@angular/core';
import { CategoriesService } from '../categories.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-add-category-dialog',
  templateUrl: './add-category-dialog.component.html',
  styleUrls: ['./add-category-dialog.component.css']
})
export class AddCategoryDialogComponent implements OnInit {

  templateCategoryName: string = "";
  editFlag: boolean = false;
  errorFlag: boolean = false;
  constructor(
    private categoriesService: CategoriesService,
    public dialogRef: MatDialogRef<AddCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public category: any
  ) {}

  ngOnInit(): void {
    if (this.category.data.edit) {
      const data = this.category.data;
      this.templateCategoryName = data.templateCategoryName;
      this.editFlag = true;
    }
  }

  createCategory() {
    if(!this.templateCategoryName ) {
      this.errorFlag = true;
      return
    }
    this.errorFlag = false;
    this.categoriesService
      .addCategory(
        {
          templateCategoryName: this.templateCategoryName,
          templateCategoryId: undefined,
          parentId: undefined,
          templateParentCategoryName: undefined,
          active: true
        },
      )
      .subscribe((response: any) => {
        this.dialogRef.close();
      });
  }

  editCategory() {
    if(!this.templateCategoryName ) {
      this.errorFlag = true;
      return
    }
    this.errorFlag = false;
    
    this.categoriesService
      .addCategory(
        {
          templateCategoryName: this.templateCategoryName,
          templateCategoryId: this.category.data.templateCategoryId,
          parentId: undefined,
          templateParentCategoryName: undefined,
          active: this.category.data.active
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
