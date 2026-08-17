import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { PaymentInstance } from 'angular-rave';
import { environment } from 'src/environments/environment';
import { PaymentModel } from '../../shared/models/PaymentModel';
import { HttpClient } from '@angular/common/http';
import * as jspdf from 'jspdf';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { NinValidationDialogComponent } from '../nin-validation-dialog/nin-validation-dialog.component';
import { PriceSelectionDialogComponent } from '../price-selection-dialog/price-selection-dialog.component';
import { UserAffidavitSaveRequest } from 'src/app/shared/models/UserAffidavitSaveRequest';
import { UserdataService } from '../userservices/userdata.service';

interface IRaveOptions {
    PBFPubKey: string;
    customer_email: string;
    customer_firstname: string;
    customer_lastname: string;
    custom_description: string;
    amount: number;
    currency: string;
    customer_phone: string;
    txref: string;
    callback: (response: object) => void;
    onclose: () => void;
    autoClose: boolean;
}

interface MyWindow extends Window {
  getpaidSetup;
}

declare let window: MyWindow;

@Component({
  selector: 'app-payment-check',
  templateUrl: './payment-check.component.html',
  styleUrls: ['./payment-check.component.css']
})
export class PaymentCheckComponent implements OnInit  {

    paymentInstance: PaymentInstance;
    affidavitprice;
    affidavitId;
    private res: any;
    pdf: jspdf;

    API_publicKey;

    private raveOptions: IRaveOptions;
    token: string;
    userfirstname;
    userlastname;
    email: string;
    phonenumber: string;
    documentname;
    paymentresponseglobal;
    transactionId;
    isAgent;

    @Input() affidavitIdFromParent: number;
    @Input() affidavitpriceFromParent: number;
    @Input() affidavitnameFromParent: string;
    @Input() isAgentFromParent: string;
    @Output() someEvent = new EventEmitter();
    @Input() isExpress: Boolean;
    @Input() isPriceDialogOpen: boolean;
    @Input() templatePrice: number;
    @Input() templateFastTrackPrice:number;

    constructor(private loadingscreenservice: LoadingscreenService, private router: Router, private http: HttpClient,
                public dialog: MatDialog, private activeroute: ActivatedRoute, private cd: ChangeDetectorRef, private ngzone: NgZone,  private userDataService: UserdataService) {
        this.API_publicKey = environment.publicKey;
        const userdata = JSON.parse(localStorage.getItem('userdata'));
        this.userfirstname = userdata['firstName'];
        this.userlastname = userdata['lastName'];
        this.phonenumber = userdata['contact'];

        if (this.phonenumber === null || this.phonenumber === undefined) {
            this.phonenumber = '';
        }
    }

    public ngOnInit(): void {
        this.affidavitId = this.affidavitIdFromParent;
        this.affidavitprice = this.affidavitpriceFromParent;
        this.documentname = this.affidavitnameFromParent;
        this.isAgent = this.isAgentFromParent;
        if (!!localStorage.getItem('userdata') && JSON.parse(localStorage.getItem('isAdmin')) == false) {
          const userData = JSON.parse(localStorage.getItem('userdata'));
          this.email = userData['email'];
        }
    }
    
      openPriceSelectionDialog(templatePrice: number, fastTrackPrice: number): MatDialogRef<PriceSelectionDialogComponent> {
        return this.dialog.open(PriceSelectionDialogComponent, {
          panelClass: 'price-dialog-container',
          data: {
            templatePrice: templatePrice,
            fastTrackPrice: fastTrackPrice
          }
        });
      }
    
      madePayment() {
        if (this.isPriceDialogOpen) {
            this.openPriceSelectionDialog(this.templatePrice, this.templateFastTrackPrice)
            .afterClosed()
            .subscribe(priceData => {
              if (priceData === 'close' || !priceData) {
                return;
              }
              const isExpress = priceData.isExpress;
              const userAffidavit = new UserAffidavitSaveRequest();
              userAffidavit.userAffidavitId = this.affidavitIdFromParent;
              userAffidavit.isExpress = isExpress;
              this.userDataService.updateIsExpress(userAffidavit).subscribe((response: any) => {
                const userAffidavitResponse = response.data;
                this.isExpress = userAffidavitResponse.isExpress;
                this.affidavitprice = this.isExpress ? this.templateFastTrackPrice : this.templatePrice;
                this.initiatePayment();
              }, (error) => {
                console.error('Error saving express value:', error);
              });
            });
        } else {
            this.initiatePayment();
        }
    }

      initiatePayment() {

        const thisInstance = this;
        thisInstance.email = this.email;

        this.ngzone.runOutsideAngular(() => {
            this.enterDummyTransaction();
            const paidSetup = window.getpaidSetup({
                PBFPubKey: environment.publicKey,
                customer_email: this.email,
                customer_firstname: this.userfirstname,
                customer_lastname: this.userlastname,
                custom_description: 'Payment for affidavits',
                amount: this.affidavitprice,
                currency: 'NGN',
                customer_phone: this.phonenumber,
                autoClose: true,
                txref: thisInstance.generateReference(),
                onclose() {},
                callback(response: any) {
                    
                    const paymentResponse = new PaymentModel();
                    thisInstance.res =  response;
                    if (thisInstance.res.tx.chargeResponseCode =='00' || thisInstance.res.tx.chargeResponseCode == '0') {
                        paymentResponse.paymentDetailId = thisInstance.transactionId;
                        paymentResponse.transactionRef = thisInstance.res.tx.txRef;
                        paymentResponse.flutterwaveRef = thisInstance.res.tx.flwRef;
                        paymentResponse.status = thisInstance.res.tx.status;
                        paymentResponse.chargedamount = thisInstance.res.tx.charged_amount;
                        paymentResponse.userAffidavitId = thisInstance.affidavitId;
                        paymentResponse.affidavitPrice  = thisInstance.affidavitprice;

                        thisInstance.savePaymentDetails(paymentResponse);
                    }
                    paidSetup.close();
                }
            });
        });
    }

    savePaymentDetails(paymentResponse) {
        this.loadingscreenservice.startLoading();
        this.paymentresponseglobal = paymentResponse;

        this.http.post(environment.url + 'user/template/updatePaymentDetails', paymentResponse)
        .subscribe((response: any) => {
            if (response.success && paymentResponse.status == 'successful') {
                this.showData();
            }
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

    showData() {
        this.ngzone.run(() => {
                this.someEvent.emit();
                this.loadingscreenservice.stopLoading();
            //comment the code for court dialouge after payment
            
            const dialogRef: MatDialogRef<NinValidationDialogComponent> = this.dialog.open(NinValidationDialogComponent, {
                disableClose: true,
                data: { affidavitId: this.affidavitId,isExpress: this.isExpress }
              });
              dialogRef.afterClosed().subscribe((data: string) => {
               this.dialog.closeAll();
                if(this.isAgent === undefined){
                    const userData = JSON.parse(localStorage.getItem('userdata'));
                    this.isAgent=userData.isAgent;
                }
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    if(this.isAgent){
                        this.router.navigate(['/user', 'myaccount', 'agent' ,'documents', data]); 
                    }else{
                        this.router.navigate(['/user', 'myaccount', 'documents', data]);
                    }
                });
              });
        });
    }

    enterDummyTransaction() {
        this.ngzone.run(() => {
            // Insert a dummy transaction in db with pending status and take that transactionId
            const paymentResponse = new PaymentModel();
            paymentResponse.paymentDetailId = 0;
            paymentResponse.status = 'pending';
            paymentResponse.affidavitPrice = 0.0;
            paymentResponse.userAffidavitId = this.affidavitId;
            this.http.post(environment.url + 'user/template/updatePaymentDetails', paymentResponse)
            .subscribe((response: any) => {
                if (response.success) {
                    this.transactionId = response.data['paymentDetailId'];
                }
            }, () => {
                
            });
        });
    }

    routeToDocumentList() {
        this.ngzone.run(() => { 
            if(this.isAgent){
                this.router.navigate(['/user', 'myaccount', 'agent' ,'documents']); 
            }
            else{
            this.router.navigate(['/user', 'myaccount', 'documents']); 
            }
        });
    }

    openAlertDialogBox(actionname: string, message: string, onlyclose, affidavitId): MatDialogRef<AlertdialogComponent>{
        const dialogRef = this.dialog.open(AlertdialogComponent, {
            data: { actionname, message, onlyclose, affidavitId }
        });
        return dialogRef;
    }

}
