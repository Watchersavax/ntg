import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //fetch data from backend

   urls:string = environment.url + "user/template/"

  constructor(private http:HttpClient) {
    
   }

  fetchTemplateList(){
    
    return this.http.get( this.urls + "all");

  }

  fetchTemplateTrimmedList(userType:String,subCategoryId:number,page :number, size :number, filtervalue: string){
    
    let url = `${this.urls}trimmed/all/${userType}/${subCategoryId}/${page}/${size}`;

    if (filtervalue) {
      url += `?filtervalue=${encodeURIComponent(filtervalue)}`;
    }
  
    return this.http.get(url);
  }

  fetchAllTemplateTrimmedList(userType:String){
    return this.http.get( this.urls + "trimmed/all/"+userType);
  }

  fetchCategoryList(){

     //fetch category list 
    return this.http.get(this.urls + "templateCategories");
  }

  getAffidavitTypes(userType:String){
    return this.http.get( this.urls + "getSubCategory/"+userType);
  }

  fetchAllAttributes(templateVersionId){
    return this.http
    .get(
      this.urls +
        "getAllTemplateAttributes/" +
        templateVersionId
    );
    
  }
}
