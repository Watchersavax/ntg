import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RegistrarDashboardResponse } from '../models/RegistrarDashboardDto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourtDashboardService {

  BASE_URL_Dashboard = environment.url + 'api/regDashboard';

  constructor(private http: HttpClient) { }

  getRegistrarDashboardData(userId: number): Observable<RegistrarDashboardResponse> {
    return this.http.get<RegistrarDashboardResponse>(this.BASE_URL_Dashboard + '/getIncomeAndSignedAff/' + userId );
  }

  getDashbaoardTableList(dataFilterModel) {
    return this.http.post(this.BASE_URL_Dashboard + '/getDashbaoardAffList', dataFilterModel);
}

exportAffidavitDataToExcel(dataFilterModel) {
  return this.http.post(this.BASE_URL_Dashboard + '/exportUserAffidavitDataToExcel', dataFilterModel, { responseType: 'blob' });
}

}
