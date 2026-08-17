import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, Sort } from '@angular/material';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { Category, SubCategory } from 'src/app/shared/models/Category';
import { CategoriesService } from './categories.service';
import { AddCategoryDialogComponent } from './add-category-dialog/add-category-dialog.component';
import { AddSubcategoryDialogComponent } from './add-subcategory-dialog/add-subcategory-dialog.component';

@Component({
  selector: 'app-managecategories',
  templateUrl: './managecategories.component.html',
  styleUrls: ['./managecategories.component.css']
})
export class ManagecategoriesComponent implements OnInit {

  categoriesList: Category[] = [];
  PAGE_SIZE = 15; // default page size
  page = 0;
  size = this.PAGE_SIZE; // current page size
  keyword: string;
  sort = 'templateCategoryId';
  order = 'ASC';
  keywordUpdate = new Subject<string>();
  dataMessage = '';
  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 2;
  infinitescrolldisable = false;
  direction = '';

  constructor(public dialog: MatDialog, public router: Router, public http: HttpClient, private loadingscreenservice: LoadingscreenService,private categoriesService:CategoriesService,private snackBar: MatSnackBar) {

  }

  ngOnInit() {
    this.fetchCategoriesList();
  }

  fetchCategoriesList() {
    this.categoriesService.getAllCategories( this.page, this.size, this.keyword, this.sort, this.order)
      .subscribe((response: any) => {
        if (response.success) {
          this.categoriesList = response.data;
        }
      });
  }

  sortData(sort: Sort) {
    this.resetPageInfo();
    if (!sort.active || sort.direction === '') {
      sort.active = 'templateCategoryId';
      sort.direction = 'asc';
    }
    this.sort = sort.active;
    this.order = sort.direction.toUpperCase();
    this.fetchCategoriesList();
  }

  addNewCategories() {
    const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
      width: "35rem",
      data: { data: { ...{ edit: false } } },
    });
    dialogRef.afterClosed().subscribe((response) => {
      this.fetchCategoriesList();
    });
  }

  editCategory(category: Category) {
    const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
      width: "35rem",
      data: { data: { ...category, edit: true } },
    });
    dialogRef.afterClosed().subscribe((response) => {
      this.fetchCategoriesList();
    });
  }

  deleteCategory(category: Category) {
    const confirmDelete = confirm(
      'Are you sure you want to delete this category? This action cannot be undone.'
    );

    if (confirmDelete) {
      this.categoriesService.deleteCategory(category.templateCategoryId).subscribe(
        (response: any) => {
          if (response.success) {
            this.categoriesList = this.categoriesList.filter(
              (cat) => cat.templateCategoryId !== category.templateCategoryId
            );
          }
        },
        (error) => {
          console.error('Error deleting category:', error);
        }
      );
    }
  }

  getSubCategory(category: Category) {
    this.router.navigate(['/admin', 'dashboard', 'subcategories'],
                          { queryParams: { categoryId: category.templateCategoryId,categoryName:category.templateCategoryName } });
  }

  onSlide(category: Category) {
    category.active = !category.active;
    this.categoriesService.activateOrDeactivateCategory(category.templateCategoryId, category.active).subscribe(
      (response: any) => {
        if (!response.success) {
          category.active = !category.active; 
        }
      },
      () => {
        category.active = !category.active; 
      }
    );
  }

  nextPage() {
    this.page++;
    this.categoriesService.getAllCategories(this.page, this.size, this.keyword, this.sort, this.order)
      .subscribe((response: any) => {
        this.categoriesList = this.categoriesList.concat(response.data);
        if (response.data.length === 0 ) {
          this.page--;
          this.dataMessage = '* no data';
          this.infinitescrolldisable = true;
        }
      });
  }

  private resetPageInfo() {
    this.page = 0;
    this.size = this.PAGE_SIZE;
    this.infinitescrolldisable = false;
  }

  addNewSubCategories(category:Category) {
    const subcategory=new SubCategory();
    subcategory.templateCategoryId=category.templateCategoryId;
    const dialogRef = this.dialog.open(AddSubcategoryDialogComponent, {
      width: "35rem",
      data: { data: {...subcategory, edit: false }  },
    });
    dialogRef.afterClosed().subscribe((response) => {
      this.fetchCategoriesList();
    });
  }

}
