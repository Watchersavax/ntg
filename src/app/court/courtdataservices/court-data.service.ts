import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AffidavitStatusUpdateRequest } from '../models/AffidavitStatusUpdateRequest';

@Injectable({
  providedIn: 'root'
})
export class CourtDataService {

  BASE_URL_USER_MANAGE = environment.url + 'manage';
  PAGE_SIZE = 15;
  BASE_URL_USER_TEMPLATE = environment.url + 'user/template';
  constructor(private http: HttpClient) {}

  getUserAffidavitsByCourtId(
    courtId: number,
    registrarStatus: string,
    page: number,
    size: number,
    userId: number,
    keyword?: string,
    sort?: string,
    order?: string,
  ) {
    const httpParams = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("keyword", !!keyword ? keyword : "")
      .set("sort", !!sort ? sort : "affidavitName")
      .set("order", !!order ? order : "ASC");

    return this.http.get(
      this.BASE_URL_USER_TEMPLATE +
        "/getcourtaffidavits/" +
        courtId +
        "/" +
        registrarStatus +
        "/"+
        userId,
      { params: httpParams }
    );
  }

  getAffidavitHtmlValueByCourtAndAffidavitId(affidavitId: number, courtId: number) {
    return this.http.get(this.BASE_URL_USER_TEMPLATE + '/getaffiprev/' + affidavitId + '/' + courtId);
  }

  updateAffidavitRegistrarStatus(affidavitRequest: AffidavitStatusUpdateRequest) {
    return this.http.post(this.BASE_URL_USER_TEMPLATE + '/updateaffregstat', affidavitRequest);
  }

  fetchAppointmentsForUser(userId:number, page :number, size :number) {
    return this.http.get(this.BASE_URL_USER_TEMPLATE + "/getAppointmentsByUserId/" + userId + "/" + page + "/" + size);
  }

  fetchAppointmentsForRegistrar(registrarId:number, page :number, size :number) {
    return this.http.get(this.BASE_URL_USER_TEMPLATE + "/getAppointmentsByRegistrarId/" + registrarId + "/" + page + "/" + size);
  }
  deleteAppoinment(appointmentId:number){
    return this.http.delete(this.BASE_URL_USER_TEMPLATE + "/deleteAppointment/" + appointmentId);
  }
  rescheduleAppoinment(appointmentId:number,appointmentOject){
    return this.http.post(this.BASE_URL_USER_TEMPLATE + "/rescheduleAppointment" ,appointmentOject);   
  }
  completeRegistrarAppoinment(appointmentId:number){
    return this.http.post(this.BASE_URL_USER_TEMPLATE + "/completeRegistrarAppointment/"+ appointmentId,{});
  }
  completeUserAppoinment(userId:number){
    return this.http.post(this.BASE_URL_USER_TEMPLATE + "/completeAttendeeAppoinment/"+ userId,{});
  }

  fetchDeponentByDeponentId(deponentId: number) {
    return this.http.get(this.BASE_URL_USER_TEMPLATE + '/getDeponentById/'+ deponentId);
  }

  fetchDeponentByAffidavitId(affidavitId: number) {
    return this.http.get(this.BASE_URL_USER_TEMPLATE + '/getDeponentByAffidavitId/'+ affidavitId);
  }

  getUserAffidavitsByCourtIdAndUserId(courtId: number, userId: number,page: number, size: number, keyword?: string,
    sort?: string, order?: string ) {
const httpParams = new HttpParams()
 .set('page', page.toString())
 .set('size', size.toString())
 .set('keyword', !!keyword ? keyword : '')
 .set('sort', !!sort ? sort : 'affidavitName')
 .set('order', !!order ? order : 'ASC');

return this.http.get(this.BASE_URL_USER_TEMPLATE + '/getcourtaffidavitsByUser/' + courtId + '/' + userId , {params: httpParams});
}
}
