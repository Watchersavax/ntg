import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from 'src/app/shared/models/Category';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  URL = environment.url + "admin/template";

  constructor(private http: HttpClient) { }

  getAllCategories(
    page: number,
    size: number,
    keyword?: string,
    sort?: string,
    order?: string
  ) {
    const httpParams = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("keyword", !!keyword ? keyword : "")
      .set("sort", !!sort ? sort : "templateCategoryId")
      .set("order", !!order ? order : "ASC");

    return this.http.get(this.URL + "/allCategories/" , {
      params: httpParams,
    });
  }

  addCategory(category: Category): Observable<any> {
    return this.http.post<any>(`${this.URL}/saveCategory`, category);
  }

  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete<any>(`${this.URL}/deleteCategory/${categoryId}`);
  }

  activateOrDeactivateCategory(templateCategoryId, isActivate) {
    return this.http.post(
      this.URL + "/category/" + templateCategoryId + "/activate/" + isActivate,
      null
    );
  }

  getAllSubCategories(
    page: number,
    size: number,
    keyword?: string,
    sort?: string,
    order?: string,
    categoryId?:number
  ) {
    const httpParams = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("keyword", !!keyword ? keyword : "")
      .set("sort", !!sort ? sort : "templateCategoryId")
      .set("order", !!order ? order : "ASC");

    return this.http.get(this.URL + "/allSubCategories/" + categoryId , {
      params: httpParams,
    });
  }

  addSubCategory(subCategory: any): Observable<any> {
    return this.http.post<any>(`${this.URL}/saveSubCategory`, subCategory);
  }

  activateOrDeactivateSubCategory(templateSubCategoryId, isActivate) {
    return this.http.post(
      this.URL + "/subcategory/" + templateSubCategoryId + "/activate/" + isActivate,
      null
    );
  }

}
