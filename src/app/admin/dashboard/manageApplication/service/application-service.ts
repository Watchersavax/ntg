import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FaqQuery } from '../model/FaqQuery';
import { FaqCategory } from '../model/FaqCategory';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  BASE_URL_FAQ = environment.url + 'faq';

  constructor(private http: HttpClient) {}

  getAllFaq() {
    return this.http.get(this.BASE_URL_FAQ + '/all/');
  }

  getPublishedFaq() {
    return this.http.get(this.BASE_URL_FAQ + '/query/published/');
  }

  saveAndUpdateFaqQuery(faqQuery: FaqQuery) {
    return this.http.post(this.BASE_URL_FAQ + '/query/save', faqQuery);
  }

  saveAndUpdateFaqCategory(faqCategory: FaqCategory) {
    return this.http.post(this.BASE_URL_FAQ + '/category/save', faqCategory);
  }

  publishFaqQuery(id: number, isPublish: boolean) {
    return this.http.post(this.BASE_URL_FAQ + '/query/' + id + '/publish/' + isPublish, null);
  }

  publishFaqCategory(id: number, isPublish: boolean) {
    return this.http.post(this.BASE_URL_FAQ + '/category/' + id + '/publish/' + isPublish, null);
  }

  nextFaqQuerySequence(categoryId: number) {
    return this.http.get(this.BASE_URL_FAQ + '/query/next/' + categoryId);
  }

  nextFaqCategorySequence() {
    return this.http.get(this.BASE_URL_FAQ + '/category/next/');
  }

  deleteFaqQuery(id: number) {
    return this.http.delete(this.BASE_URL_FAQ + '/query/' + id);
  }

  deleteFaqCategory(id: number) {
    return this.http.delete(this.BASE_URL_FAQ + '/category/' + id);
  }

  faqCategorySelector() {
    return this.http.get(this.BASE_URL_FAQ + '/category/selector/');
  }

}
