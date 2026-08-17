import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CategorySubCategoryTemplate } from 'src/app/shared/models/Category';
import { Subject } from 'rxjs';
import { TableRows } from 'src/app/shared/models/TableRows';

@Injectable({
  providedIn: 'root'
})
export class UserdataService {

  //fetch data from backend
  templateCategoryList:CategorySubCategoryTemplate[];
  datareadyflag  = new Subject<CategorySubCategoryTemplate[]>();
  templatelist:TableRows[]=[];
  templatelistdataflag = new Subject<TableRows[]>();

  urls:string = environment.url + "user/template/";

  constructor(private http:HttpClient) {
    
   }

  fetchTemplateObjectById(templateId){
    
    return this.http.get( this.urls + "getTemplateByTemplateId/"+templateId);

  }

  fetchAllConditionsForTemplate(templateVersionId){
    
    return this.http.get(this.urls+"getTemplateParagraphCondition/"+templateVersionId);
  
  }
  
  fetchListOfAllAttributes(templateVersionId){
    
    return this.http.get(this.urls + "getTemplateAttributes/"+templateVersionId);
  
  }

  userloginRequest(loginModal){
    
    return this.http.post(environment.url + "api/auth/signin", loginModal);
  
  }

  userRegisterRequest(registermodal){
    
    return this.http.post(environment.url + "api/auth/signup", registermodal)
  
  }

  userForgotRequest(email){
    
    return this.http.post(environment.url + "api/auth/resetPassword",email);
  
  }

  saveAffidavitDataForUser(request){
    
    return this.http.post(this.urls+'saveAffidavit',request);
  
  }

  setGlobalTempCatSubData(templatecatlist){
    
    this.templateCategoryList = templatecatlist;
    this.datareadyflag.next(this.templateCategoryList);
  
  }

  setGlobalTemplateList(templatelist){
    this.templatelist  = templatelist;
    this.templatelistdataflag.next([]);
    this.templatelistdataflag.next(this.templatelist);
  }

  fetchAllUserAffidavit(userid){
    return this.http.get(this.urls+"getUserAffidavit/"+userid);
  }

  fetchAllUserAffidavitByStatus(userid,status,regstatus){
    return this.http.get(this.urls+"getUserAffidavit/"+userid+"/"+status+"/"+regstatus);
  }

  fetchUserAffidavitData(useraffidavitId){
    return this.http.get(this.urls+"getUserAffidavitByAffidavitId/"+useraffidavitId);
  }

  getAllUserTransactions(userId,httpparams){
    return this.http.get(this.urls+"gettransactions/"+userId,{params:httpparams});
  }

  deleteUserAffidavitById(userAffidavitId: number) {
    return this.http.delete(this.urls + 'userAffidavit/' + userAffidavitId);
  }
  saveADeponentData(deponentRequest){
    return this.http.post(this.urls+'saveDeponent',deponentRequest);
  }

  fetchAllAgentUserAffidavitByStatus(userid,status,regstatus){
    return this.http.get(this.urls+"getAgentAffidavit/"+userid+"/"+status+"/"+regstatus);
  }

  cancelScheduledAppointment(userAffidavitId: number) {
    return this.http.post(environment.url + 'calendly/cancel-scheduled-appointment', { userAffidavitId });
  }

  fetchTemplateForSystemGenerated(){
    return this.http.get( this.urls + "getTemplateByIsSystemGenerated");
  }

  fetchTemplateForCaseRelated(){
    return this.http.get( this.urls + "getTemplateByIsCaseRelated");
  }

  updateIsExpress(request) {
    return this.http.post(this.urls+'updateIsExpress',request);
  }
}
