import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class CalendlyAppointmentDialogService {
  BASE_URL = environment.url + "calendly/";
 
  constructor(private http: HttpClient) {}
 
  saveScheduledEvents(option: any): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.http.post(this.BASE_URL + "save-scheduled-events", option, {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        })
        .toPromise()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
      }, 7000); // 7 second delay
    });
  }
  //   // return fetch(this.BASE_URL +"")

  getCalendlyUrl(option: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.BASE_URL + "getCalendlyAvailableUser", option, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
        }),
      })
      .toPromise()
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  getDaysAndSlots(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.BASE_URL}getDaysAndSlots`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .toPromise()
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
    });
  }
}
