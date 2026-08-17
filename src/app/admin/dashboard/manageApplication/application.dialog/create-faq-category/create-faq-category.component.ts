import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApplicationService } from '../../service/application-service';
import { FaqCategory } from '../../model/FaqCategory';
import { SelectorModel } from '../../../manageUsers/userModels/SelectorModel';

@Component({
  selector: 'app-create-faq-category',
  templateUrl: './create-faq-category.component.html',
  styleUrls: ['./create-faq-category.component.css']
})
export class CreateFaqCategoryComponent implements OnInit {

  createFaqCategory: FormGroup;
  faqCategoryList: SelectorModel[];
  errorMessage = '';
  errorFlag = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CreateFaqCategoryComponent>,
              private applicationService: ApplicationService) {
    this.dialogRef.disableClose = true;
    this.createFaqCategory = new FormGroup({

      name: new FormControl('', Validators.required),
      sequence: new FormControl(data.sequence, Validators.required)
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
      console.error('Create FAQ category: failed to fetch category selector', error);
      this.showErrorMessage('Faq category selector failed error!');
    });
  }

  onSubmit() {

    if (this.createFaqCategory.status !== 'INVALID') {
      let faqCategory = new FaqCategory();
      
      faqCategory.name = this.createFaqCategory.controls.name.value.trim();
      faqCategory.sequence = this.createFaqCategory.controls.sequence.value;

      // Send post request to save faqCategory
      this.applicationService.saveAndUpdateFaqCategory(faqCategory)
        .subscribe((response: any) => {
          if (response.success) {
            faqCategory = response.data;
            this.dialogRef.close(faqCategory);
          } else {
            let errorMessage = 'Can not be saved right now !';
            if (response.error.status !== '500') {
              errorMessage = response.error.error;
            }
            this.showErrorMessage(errorMessage);
          }
        }, (error) => {
          console.error('Create FAQ category: failed to save category', error);
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

}
