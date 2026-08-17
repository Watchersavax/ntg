import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserDataService } from '../../UserServices/user-data.service';
import { UserAffidavit } from 'src/app/user/user-models/UserAffidavit';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-affidavit-payment-dialog',
  templateUrl: './user-affidavit-payment-dialog.component.html',
  styleUrls: ['./user-affidavit-payment-dialog.component.css']
})

export class UserAffidavitPaymentDialogComponent implements OnInit {

  userAffidavitPayment: FormGroup;
  errorMessage = '';
  errorFlag = false;
  userAffidavit = new UserAffidavit();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UserAffidavitPaymentDialogComponent>,
              private userDataService: UserDataService, private http: HttpClient) {

    this.dialogRef.disableClose = true;
    this.userAffidavit = data.userAffidavit;

    this.userAffidavitPayment = new FormGroup({
      flutterwaveRef: new FormControl('', Validators.required),
      transactionRef: new FormControl('', Validators.required),
      affidavitPrice: new FormControl(this.userAffidavit.price, Validators.required)
    });

  }

  ngOnInit() { }

  onSubmit() {
    if (this.userAffidavitPayment.status !== 'INVALID') {
      this.userAffidavit.flutterwaveRef = this.userAffidavitPayment.controls.flutterwaveRef.value;
      this.userAffidavit.transactionRef = this.userAffidavitPayment.controls.transactionRef.value;
      this.userAffidavit.affidavitPrice = this.userAffidavit.price;
      this.userAffidavit.chargedamount = this.userAffidavitPayment.controls.affidavitPrice.value;

      this.userAffidavit.status = 'successful';
      // Send post request to update userAffidavit payment status to paid
      this.userDataService.payForUserAffidavit(this.userAffidavit)
        .subscribe((response: any) => {
          if (response.success) {
            this.dialogRef.close(response.data);
          } else {
            this.userAffidavit.status = 'Pending';
            let errorMessage = 'Can not Update Status as Paid !';
            if (response.error.status !== '500') {
              errorMessage = response.error.error;
            }
            this.showErrorMessage(errorMessage);
          }
        }, () => {
          this.userAffidavit.status = 'Pending';
          this.showErrorMessage('Error! Something went wrong.');
        });
    } else {
      this.userAffidavit.status = 'Pending';
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
