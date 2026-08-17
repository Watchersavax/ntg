import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FaqQuery } from '../../model/FaqQuery';
import { ApplicationService } from '../../service/application-service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { SelectorModel } from '../../../manageUsers/userModels/SelectorModel';

@Component({
  selector: 'app-edit-faq-query',
  templateUrl: './edit-faq-query.component.html',
  styleUrls: ['./edit-faq-query.component.css']
})

export class EditFaqQueryComponent implements OnInit {

  public classicEditor = ClassicEditor;
  editFaqQuery: FormGroup;
  errorMessage = '';
  errorFlag = false;
  faqQuery = new FaqQuery();
  faqCategoryList: SelectorModel[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EditFaqQueryComponent>,
              private applicationService: ApplicationService) {

    this.dialogRef.disableClose = true;
    this.faqQuery = data.faqQuery;

    this.editFaqQuery = new FormGroup({
      name: new FormControl(this.faqQuery.name, Validators.required),
      description: new FormControl(this.faqQuery.description, Validators.required),
      sequence: new FormControl(this.faqQuery.sequence, Validators.required),
      categoryId: new FormControl(this.faqQuery.categoryId, Validators.required)
    });

  }

  ngOnInit() {
    this.applicationService.faqCategorySelector().subscribe((response: any) => {
      if (response.success) {
        this.faqCategoryList = response.data;
      } else {
        this.showErrorMessage('Faq category selector failed failure!');
      }
    }, (error) => {
      console.error('Edit FAQ query: failed to fetch category selector', error);
      this.showErrorMessage('Faq category selector failed error!');
    });
  }

  onSubmit() {

    if (this.editFaqQuery.status !== 'INVALID') {

      if (this.editFaqQuery.controls.name.value.trim().length > 0) {
        this.faqQuery.name = this.editFaqQuery.controls.name.value.trim();
        this.faqQuery.description = this.editFaqQuery.controls.description.value;
        this.faqQuery.sequence = this.editFaqQuery.controls.sequence.value;
        this.faqQuery.categoryId = this.editFaqQuery.controls.categoryId.value;

        // Send post request to update faqQuery
        this.applicationService.saveAndUpdateFaqQuery(this.faqQuery)
          .subscribe((response: any) => {
            if (response.success) {
              this.dialogRef.close(response.data);
            } else {
              let errorMessage = 'Can not Update Details !';
              if (response.error.status !== '500') {
                errorMessage = response.error.error;
              }
              this.showErrorMessage(errorMessage);
            }
          }, (error) => {
            console.error('Edit FAQ query: failed to save query', error);
            this.showErrorMessage('Error! Something went wrong.');
          });
      } else {
        return false;
      }
    } else {
      this.showErrorMessage('*Please fill all the fields');
    }
  }

  showErrorMessage(message: any) {
    this.errorFlag = true;
    this.errorMessage = '' + message;
  }

  keyDownFunction(event: any) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

}
