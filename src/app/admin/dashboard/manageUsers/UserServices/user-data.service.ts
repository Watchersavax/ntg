import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { PageParam } from "../../../../shared/models/PageParam";
import { UserAffidavit } from "src/app/user/user-models/UserAffidavit";

@Injectable({
  providedIn: "root",
})
export class UserDataService {
  BASE_URL_MANAGE_USER = environment.url + "manage";
  BASE_URL_USER_TEMPLATE = environment.url + "user/template";
  BASE_URI_CALENDLY = `${environment.url}calendly/user/`;
  PAGE_SIZE = 15;

  constructor(private http: HttpClient) {}

  getAllUsersData(
    roleId: number,
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
      .set("sort", !!sort ? sort : "firstName")
      .set("order", !!order ? order : "ASC")
      .set("stateId", "" + 0);

    return this.http.get(this.BASE_URL_MANAGE_USER + "/allUsers/" + roleId, {
      params: httpParams,
    });
  }

  getAllUsersDataWithStateId(
    stateId: number,
    roleId: number,
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
      .set("sort", !!sort ? sort : "firstName")
      .set("order", !!order ? order : "ASC")
      .set("stateId", stateId.toString());

    return this.http.get(this.BASE_URL_MANAGE_USER + "/allUsers/" + roleId, {
      params: httpParams,
    });
  }

  saveAndUpdateUserData(userModel) {
    return this.http.post(this.BASE_URL_MANAGE_USER + "/user/save", userModel);
  }

  manageProfile(userModel) {
    return this.http.post(this.BASE_URL_MANAGE_USER + "/profile", userModel);
  }

  activateOrDeactivateUser(userId, isActivate) {
    return this.http.post(
      this.BASE_URL_MANAGE_USER + "/user/" + userId + "/activate/" + isActivate,
      null
    );
  }

  getAllTemplates(page, pagesize) {
    return this.http.get(
      this.BASE_URL_MANAGE_USER + "/allTemplates/" + page + "/" + this.PAGE_SIZE
    );
  }

  getUserAffidavit(userId) {
    return this.http.get(
      this.BASE_URL_USER_TEMPLATE + "/getUserAffidavit/" + userId
    );
  }

  getUserAffidavitByStatus(
    userId: number,
    status: string,
    registrarStatus: string,
    pageParam: PageParam
  ) {
    const httpParams = new HttpParams()
      .append("page", pageParam.page.toString())
      .append("size", pageParam.size.toString())
      .append("keyword", !!pageParam.keyword ? pageParam.keyword : "")
      .append("sort", !!pageParam.sort ? pageParam.sort : "templateName")
      .append("order", !!pageParam.order ? pageParam.order : "ASC");
    const url =
      this.BASE_URL_USER_TEMPLATE +
      "/getUserAffidavit/" +
      userId +
      "/" +
      status +
      "/" +
      registrarStatus;

    return this.http.get(url, { params: httpParams });
  }

  payForUserAffidavit(userAffidavit: UserAffidavit) {
    return this.http.post(
      this.BASE_URL_USER_TEMPLATE + "/updatePaymentDetails/",
      userAffidavit
    );
  }

  deleteUser(userId) {
    return this.http.delete(
      this.BASE_URL_MANAGE_USER + "/deleteUser/" + userId
    );
  }

  getAdminPermissionByUserId(userId) {
    return this.http.get(this.BASE_URL_MANAGE_USER + "/getAdminPermissionByUserId/" + userId);
  }

  getCalendlyUserDetail(email) {
    return this.http.get(this.BASE_URI_CALENDLY + email);
  }

  getSessionByType(isExpress) {
    return this.http.get(`${environment.url}calendly/sessionsbytype/${isExpress}`);
  }

  getAllSession() {
    return this.http.get(`${environment.url}calendly/sessions`);
  }

  saveSession(session) {
    return this.http.post(`${environment.url}calendly/save/session`,session); 
  }

  editSession(session) {
    return this.http.post(`${environment.url}calendly/save/session`,session); 
  }

  deleteSession(sessionId) {
    return this.http.delete(`${environment.url}calendly/deleteSession/${sessionId}`); 
  }

  editSessionStatus(session) {
    return this.http.post(`${environment.url}calendly/session/activate/${session.sessionId}/${session.isActive}`,session);
  }
}
