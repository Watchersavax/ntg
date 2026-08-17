import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserdetailsService {

  urls: string = environment.url + "user/account/"

  constructor(private http: HttpClient) {

  }

  fetchUserDetails(userid) {
    return this.http.get(this.urls + "getUserDetails/" + userid);
  }

  fetchStateList() {
    return this.http.get(this.urls + "getAllStates");
  }

  fetchCityList(stateid) {
    return this.http.get(this.urls + "getAllCitiesByStateId/" + stateid);
  }

  updateUserDetails(userobject) {
    return this.http.post(this.urls + "updateUser", userobject);
  }

  sendPhoneVerificationOtp() {
    return this.http.post(this.urls + "phone-verification/send-otp", {});
  }

  verifyPhoneOtp(otp) {
    return this.http.post(this.urls + "phone-verification/verify", { otp: otp });
  }
  
  ninValidationCheck(ninValidation){
    return this.http.post(this.urls+'validateNIN',ninValidation);
  }

  getAllVerificationType(isFirm) {
    return this.http.get(this.urls + "getAllVerificationType/"+isFirm);
  }

  getAllVerificationTypes() {
    return this.http.get(this.urls + "getAllVerifications");
  }
 
  getAllVerificationTypeByAffidavitId(affidavitId,userType){
    return this.http.get(`${this.urls}getAllVerificationTypeByAffidavitId/${affidavitId}/${userType}`);
  }

  getAllVerificationTypeByTemplateId(templateId){
    return this.http.get(this.urls + "getVerificationTypes/"+templateId);
  }

}
