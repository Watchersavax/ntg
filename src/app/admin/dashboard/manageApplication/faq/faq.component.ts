import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FaqCategory } from '../model/FaqCategory';
import { ApplicationService } from '../service/application-service';
import { FaqQuery } from '../model/FaqQuery';
import { CreateFaqQueryComponent } from '../application.dialog/create-faq-query/create-faq-query.component';
import { EditFaqQueryComponent } from '../application.dialog/edit-faq-query/edit-faq-query.component';
import { CreateFaqCategoryComponent } from '../application.dialog/create-faq-category/create-faq-category.component';
import { EditFaqCategoryComponent } from '../application.dialog/edit-faq-category/edit-faq-category.component';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})

export class FaqComponent implements OnInit {

  faqList: FaqCategory[] = [];
  dataMessage = '';

  constructor(private applicationService: ApplicationService, public dialog: MatDialog) { }

  ngOnInit() {
    this.fetchAllFaqList();
  }

  fetchAllFaqList() {
    this.faqList = [];
    this.applicationService.getAllFaq().subscribe((response: any) => {
      if (response.success) {
        this.faqList = response.data;
      }
    });
  }

  fetchPublishedFaqList() {
    this.faqList = [];
    this.applicationService.getPublishedFaq().subscribe((response: any) => {
      if (response.success) {
        this.faqList = response.data;
      }
    });
  }

  createFaqQuery(categoryId: number) {
    this.applicationService.nextFaqQuerySequence(categoryId)
      .subscribe((response: any) => {
        if (response.data) {
          const sequence = response.data;
          const dialogRef = this.dialog.open(CreateFaqQueryComponent, { data: { categoryId, sequence } });
          dialogRef.afterClosed().subscribe((data) => {
            
            if (data === 'false') {
              return;
            }
            this.fetchAllFaqList();
          });
        }
      }, (error) => {
        console.error('FAQ: failed to fetch next query sequence', error);
      });
  }

  editFaqQuery(event, faqQuery: FaqQuery) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(EditFaqQueryComponent, { data: { faqQuery: { ...faqQuery } } });
    dialogRef.afterClosed().subscribe((data) => {
      
      if (data === 'false') {
        return;
      }
      this.fetchAllFaqList();
    });
  }

  publishQuery(faqQuery: FaqQuery) {
    faqQuery.active = !faqQuery.active;
    this.applicationService.publishFaqQuery(faqQuery.id, faqQuery.active)
      .subscribe((response: any) => {
        if (!response.success) {
          faqQuery.active = !faqQuery.active;
        }
      }, (error) => {
        console.error('FAQ: failed to publish query', error);
        faqQuery.active = !faqQuery.active;
      });
  }

  createFaqCategory() {
    this.applicationService.nextFaqCategorySequence()
      .subscribe((response: any) => {
        if (response.success) {
          const dialogRef = this.dialog.open(CreateFaqCategoryComponent, { data: { sequence: response.data } });
          dialogRef.afterClosed().subscribe((data) => {
            if (!data || data == 'false') {
              return;
            }
            this.fetchAllFaqList();
          });
        }
      }, (error) => {
        console.error('FAQ: failed to fetch next category sequence', error);
      });
  }

  editFaqCategory(faqCategory: FaqCategory) {
    const dialogRef = this.dialog.open(EditFaqCategoryComponent, { data: { faqCategory: { ...faqCategory } } });
    dialogRef.afterClosed().subscribe((data) => {
      if (!data || data == 'false') {
        return;
      }
      this.fetchAllFaqList();
    });
  }

  publishCategory(faqCategory: FaqCategory) {
    faqCategory.active = !faqCategory.active;
    this.applicationService.publishFaqCategory(faqCategory.id, faqCategory.active)
      .subscribe((response: any) => {
        if (!response.success) {
          faqCategory.active = !faqCategory.active;
        }
      }, (error) => {
        console.error('FAQ: failed to publish category', error);
        faqCategory.active = !faqCategory.active;
      });
  }

  deleteFaqQuery(event, id: number) {
    event.stopPropagation();
    const confirmationMessage = 'Are you sure to delete this query?';
    this.dialog.open(AlertdialogComponent, { data: { actionname: 'Delete Query', message: confirmationMessage, onlyclose: false } })
      .afterClosed()
      .subscribe(data => {
        if (data === 'Yes') {
          this.applicationService.deleteFaqQuery(id)
            .subscribe((response: any) => {
              if (response.success) {
                this.fetchAllFaqList();
              }
            }, (error) => {
              console.error('FAQ: failed to delete query', error);
              this.alert('Category Not Deleted!', 'Something went wrong while deleting FAQ Query!');
            });
        }
      });
  }

  deleteFaqCategory(id: number) {
    const confirmationMessage = 'Are you sure to delete this category?';
    this.dialog.open(AlertdialogComponent, { data: { actionname: 'Delete Category', message: confirmationMessage, onlyclose: false } })
      .afterClosed()
      .subscribe(data => {
        if (data === 'Yes') {
          const actionName = 'Category Not Deleted!';
          this.applicationService.deleteFaqCategory(id)
            .subscribe((response: any) => {
              if (response.success) {
                this.fetchAllFaqList();
              } else if (response.error) {
                this.alert(actionName, response.error.error);
              }
            }, (error) => {
              console.error('FAQ: failed to delete category', error);
              this.alert(actionName, 'Something went wrong while deleting FAQ Category!');
            });
        }
      });
  }

  alert(actionName: string, message: string) {
    this.dialog.open(AlertdialogComponent, {
      data: { actionname: actionName, message, onlyclose: true }
    });
  }

  scroll(id: number) {
    document.getElementById(id.toString()).scrollIntoView(true);
  }

}
