import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FaqCategory } from '../../model/FaqCategory';
import { ApplicationService } from '../../service/application-service';
import { SelectorModel } from '../../../manageUsers/userModels/SelectorModel';

@Component({
  selector: 'app-edit-faq-category',
  templateUrl: './edit-faq-category.component.html',
  styleUrls: ['./edit-faq-category.component.css']
})

export class EditFaqCategoryComponent implements OnInit {

  editFaqCategory: FormGroup;
  errorMessage = '';
  errorFlag = false;
  faqCategory = new FaqCategory();
  faqCategoryList: SelectorModel[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EditFaqCategoryComponent>,
              private applicationService: ApplicationService) {

    this.dialogRef.disableClose = true;
    this.faqCategory = data.faqCategory;

    this.editFaqCategory = new FormGroup({
      name: new FormControl(this.faqCategory.name, Validators.required),
      sequence: new FormControl(this.faqCategory.sequence, Validators.required)
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
      console.error('Edit FAQ category: failed to fetch category selector', error);
      this.showErrorMessage('Faq category selector failed error!');
    });
  }

  onSubmit() {

    if (this.editFaqCategory.status !== 'INVALID') {
      if (this.editFaqCategory.controls.name.value.trim().length > 0) {
        this.faqCategory.name = this.editFaqCategory.controls.name.value.trim();
        this.faqCategory.sequence = this.editFaqCategory.controls.sequence.value;

        // Send post request to update faqCategory
        this.applicationService.saveAndUpdateFaqCategory(this.faqCategory)
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
            console.error('Edit FAQ category: failed to save category', error);
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

}
