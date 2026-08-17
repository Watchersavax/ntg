import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParagraphConditionService {

   BASE_URL = environment.url + 'admin/template/';

  constructor(private http:HttpClient) { }

    fetchAllConditionsForTemplate(templateVersionId){
    
    return this.http.get(this.BASE_URL+"getTemplateParagraphCondition/"+templateVersionId);
  
  }

}