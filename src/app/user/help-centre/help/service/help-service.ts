import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HelpService {

  BASE_URL_FAQ = environment.url + 'faq';

  constructor(private http: HttpClient) {}

  getPublishedFaq() {
    return this.http.get(this.BASE_URL_FAQ + '/published/');
  }
}
