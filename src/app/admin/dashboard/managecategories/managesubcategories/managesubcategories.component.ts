import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoriesService } from '../categories.service';
import { Subject } from 'rxjs';
import { SubCategory } from 'src/app/shared/models/Category';
import { MatDialog, Sort } from '@angular/material';
import { AddSubcategoryDialogComponent } from '../add-subcategory-dialog/add-subcategory-dialog.component';

@Component({
  selector: 'app-managesubcategories',
  templateUrl: './managesubcategories.component.html',
  styleUrls: ['./managesubcategories.component.css']
})
export class ManagesubcategoriesComponent implements OnInit {

  categoryId:number;
  categoryName:string;
  subCategoriesList: SubCategory[] = [];
  PAGE_SIZE = 15; 
  page = 0;
  size = this.PAGE_SIZE; 
  keyword: string;
  sort = 'templateSubCategoryId';
  order = 'ASC';
  keywordUpdate = new Subject<string>();
  dataMessage = '';
  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 2;
  infinitescrolldisable = false;
  direction = '';
  
  constructor(private activeroute: ActivatedRoute,private categoriesService:CategoriesService,public dialog: MatDialog) { }

  ngOnInit() {

    this.activeroute.queryParams.subscribe(params => {
      this.categoryId = params.categoryId;
      this.categoryName = params.categoryName;
      this.fetchSubCategoryList();
    });
  }

  fetchSubCategoryList() {
    this.categoriesService.getAllSubCategories( this.page, this.size, this.keyword, this.sort, this.order,this.categoryId)
      .subscribe((response: any) => {
        if (response.success) {
          this.subCategoriesList = response.data;
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
    this.fetchSubCategoryList();
  }

  addNewSubCategories() {
    const subcategory=new SubCategory();
    subcategory.templateCategoryId=this.categoryId;
    const dialogRef = this.dialog.open(AddSubcategoryDialogComponent, {
      width: "35rem",
      data: { data: {...subcategory, edit: false }  },
    });
    dialogRef.afterClosed().subscribe((response) => {
      this.fetchSubCategoryList();
    });
  }

  editSubCategory(subcategory: SubCategory) {
    subcategory.templateCategoryId=this.categoryId;
    const dialogRef = this.dialog.open(AddSubcategoryDialogComponent, {
      width: "35rem",
      data: { data: { ...subcategory, edit: true } },
    });
    dialogRef.afterClosed().subscribe((response) => {
      this.fetchSubCategoryList();
    });
  }

  onSlide(subcategory: SubCategory) {
    subcategory.active = !subcategory.active;
    this.categoriesService.activateOrDeactivateSubCategory(subcategory.templateSubCategoryId, subcategory.active).subscribe(
      (response: any) => {
        if (!response.success) {
          subcategory.active = !subcategory.active; 
        }
      },
      () => {
        subcategory.active = !subcategory.active; 
      }
    );
  }

  nextPage() {
    this.page++;
    this.categoriesService.getAllSubCategories(this.page, this.size, this.keyword, this.sort, this.order,this.categoryId)
      .subscribe((response: any) => {
        this.subCategoriesList = this.subCategoriesList.concat(response.data);
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

}
