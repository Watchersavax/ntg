import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { QuestionGroupUpdateRequest } from 'src/app/shared/models/QuestionGroupUpdateRequest';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

   BASE_URL = environment.url + 'admin/template/';

  constructor(private http:HttpClient) { }

  addNewQuestion(templateQuestion){
     return this.http.post(this.BASE_URL+"addNewQuestion",templateQuestion);
  }

  updateQuestion(templateQuestion){
    return this.http.post(this.BASE_URL+"updateQuestion",templateQuestion);
  }

  getAllTemplateGroups(templateversionid){
    return this.http.get(this.BASE_URL+"getAllTemplateGroups/"+templateversionid);
  }

  getAllTemplateAttributes(templateversionid){
    return this.http.get(this.BASE_URL+"getAllTemplateAttributes/"+templateversionid);
  }

  getAllQuestionAttributes(templateQuestionId){
    return this.http.get(this.BASE_URL + "getAllQuestionAttributes/"+templateQuestionId);
  }

  deleteQuestionFromTemplateVersion(templateQuestionId){
    return this.http.post(this.BASE_URL+"deleteQuestion/"+templateQuestionId,{});
  }

  getAllGroupTemplateQuestions(templatepublishedversion){
    return this.http
      .get(
        this.BASE_URL + 
          "getAllGroupTemplateQuestions/" +
          templatepublishedversion
      )
  }

  updateGroupSequencing(questionGroupUpdateRequest : QuestionGroupUpdateRequest){
    return this.http.post(this.BASE_URL+"updateGroupSequences",questionGroupUpdateRequest);
    
  }
}
