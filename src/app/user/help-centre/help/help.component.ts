import { Component, OnInit } from '@angular/core';
import { HelpService } from './service/help-service';
import { FaqCategory } from 'src/app/admin/dashboard/manageApplication/model/FaqCategory';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})

export class HelpComponent implements OnInit {

  faqList: FaqCategory[] = [];
  dataMessage = '';

  constructor(private helpService: HelpService) { }

  ngOnInit() {
    this.fetchPublishedFaqList();
  }

  fetchPublishedFaqList() {
    this.faqList = [];
    this.helpService.getPublishedFaq().subscribe((response: any) => {
      if (response.success) {
        this.faqList = response.data;
      }
    });
  }

  scroll(id: number) {
    document.getElementById(id.toString()).scrollIntoView(true);
  }

}
