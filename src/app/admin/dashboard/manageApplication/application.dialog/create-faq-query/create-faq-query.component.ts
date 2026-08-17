import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApplicationService } from '../../service/application-service';
import { FaqQuery } from '../../model/FaqQuery';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { SelectorModel } from '../../../manageUsers/userModels/SelectorModel';

@Component({
  selector: 'app-create-faq-query',
  templateUrl: './create-faq-query.component.html',
  styleUrls: ['./create-faq-query.component.css']
})
export class CreateFaqQueryComponent implements OnInit {

  public classicEditor = ClassicEditor;
  description: string;
  createFaqQuery: FormGroup;
  faqCategoryList: SelectorModel[];
  errorMessage = '';
  errorFlag = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CreateFaqQueryComponent>,
              private applicationService: ApplicationService) {
    this.dialogRef.disableClose = true;
    this.createFaqQuery = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      sequence: new FormControl(data.sequence, Validators.required),
      categoryId: new FormControl(data.categoryId, Validators.required)
    });
  }

  ngOnInit() {
    this.faqCategorySelector();
  }

  faqCategorySelector() {
    this.applicationService.faqCategorySelector()
      .subscribe((response: any) => {
        if (response.success) {
          this.faqCategoryList = response.data;
        } else {
          this.showErrorMessage('Faq category selector failed failure!');
        }
      }, (error) => {
        console.error('Create FAQ query: failed to fetch category selector', error);
        this.showErrorMessage('Faq category selector failed error!');
      });
  }

  onSubmit() {
    if (this.createFaqQuery.status !== 'INVALID') {
      let faqQuery = new FaqQuery();
      faqQuery.name = this.createFaqQuery.controls.name.value.trim();
      faqQuery.description = this.createFaqQuery.controls.description.value;
      faqQuery.sequence = this.createFaqQuery.controls.sequence.value;
      faqQuery.categoryId = this.createFaqQuery.controls.categoryId.value;

      // Send post request to save faqQuery
      this.applicationService.saveAndUpdateFaqQuery(faqQuery).subscribe((response: any) => {
        if (response.success) {
          faqQuery = response.data;
          this.dialogRef.close(faqQuery);
        } else {
          let errorMessage = 'Can not be saved right now !';
          if (response.error.status !== '500') {
            errorMessage = response.error.error;
          }
          this.showErrorMessage(errorMessage);
        }
      }, (error) => {
        console.error('Create FAQ query: failed to save query', error);
        this.showErrorMessage('Error! Something went wrong.');
      });
    } else {
      this.showErrorMessage('*Please fill all the fields');
    }
  }

  showErrorMessage(message: string) {
    this.errorFlag = true;
    this.errorMessage = message;
  }

  keyDownFunction(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

}
