import { Component, OnInit, Output, Input, EventEmitter, NgZone } from '@angular/core';

import { PaymentInstance } from 'angular-rave';
import { environment } from 'src/environments/environment';
import { PaymentModel } from '../../shared/models/PaymentModel';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { SignupRequestModel } from 'src/app/shared/models/SignupRequestModel';

interface MyWindow extends Window {
  getpaidSetup;
}

declare let window: MyWindow;
@Component({
  selector: 'app-registration-payment',
  templateUrl: './registration-payment.component.html',
  styleUrls: ['./registration-payment.component.css']
})
export class RegistrationPaymnetComponent implements OnInit {
  paymentInstance: PaymentInstance;
  registrationPrice: number;
  userId: number;
  private res: any;
  apiPublicKey: any;
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  documentName: string;
  paymentModel: PaymentModel;
  transactionId: number;

  @Input() registerModel: SignupRequestModel;

  @Output() registerEvent = new EventEmitter();

  constructor(private loadingScreenService: LoadingscreenService, private http: HttpClient,
              public dialog: MatDialog, private ngzone: NgZone) {
    this.apiPublicKey = environment.publicKey;
  }

  public ngOnInit(): void {
    this.registrationPrice = this.registerModel.registrationPrice;
    this.email = this.registerModel.email;
    this.firstName = this.registerModel.firstName;
    this.lastName = this.registerModel.lastName;
  }

  makePayment() {
    const thisInstance = this;

    this.ngzone
    .runOutsideAngular(
      () => {
        this.enterDummyTransaction();
        const x = window.getpaidSetup({
          PBFPubKey: environment.publicKey,
          customer_email: thisInstance.email,
          customer_firstname: thisInstance.firstName,
          customer_lastname: thisInstance.lastName,
          custom_description: 'Payment for affidavits',
          amount: thisInstance.registrationPrice,
          currency: 'NGN',
          customer_phone: thisInstance.contact,
          autoClose: true,
          txref: thisInstance.generateReference(),
          onclose() { },
          callback(response: any) {
            const paymentModel = new PaymentModel();
            thisInstance.res = response;
            if (thisInstance.res.tx.chargeResponseCode == '00' || thisInstance.res.tx.chargeResponseCode == '0') {
              paymentModel.paymentDetailId = thisInstance.transactionId;
              paymentModel.transactionRef = thisInstance.res.tx.txRef;
              paymentModel.flutterwaveRef = thisInstance.res.tx.flwRef;
              paymentModel.status = thisInstance.res.tx.status;
              paymentModel.chargedamount = thisInstance.res.tx.charged_amount;
              paymentModel.registrationPrice = thisInstance.registrationPrice;

              thisInstance.savePaymentDetails(paymentModel);
            }
            x.close();
          }
        });
      }
    );
  }

  savePaymentDetails(paymentModel: PaymentModel) {
    this.ngzone
    .run(() => {
      this.loadingScreenService.startLoading();
      this.paymentModel = paymentModel;

      this.http.post(environment.url + 'manage/updatePaymentDetails', paymentModel).subscribe(
        (response: any) => {
          if (response.success && paymentModel.status === 'successful') {
            this.registerEvent.next(paymentModel.paymentDetailId);
          }
        });
      });
  }

  generateReference(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  enterDummyTransaction() {
    this.ngzone
      .run(
        () => {
          // Insert a dummy transaction in db with pending status and take that transactionId
          const paymentModel = new PaymentModel();
          paymentModel.paymentDetailId = 0;
          paymentModel.status = 'pending';
          paymentModel.registrationPrice = 0.0;
          this.http.post(environment.url + 'manage/updatePaymentDetails', paymentModel)
            .subscribe(
              (response: any) => {
                if (response.success) {
                  this.transactionId = response.data.paymentDetailId;
                }
              },
              () => {
                
              }
            );
        }
      );
  }
}
