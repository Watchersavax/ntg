import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { BarcodeReaderComponent } from './barcode-reader/barcode-reader.component';
import { CourtDataService } from '../courtdataservices/court-data.service';
import { CourtAffidavitUserResponse } from '../models/CourtAffidavitUserResponse';
import { AffidavtViewComponent } from './affidavt-view/affidavt-view.component';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { AffidavitStatusUpdateRequest } from '../models/AffidavitStatusUpdateRequest';
import { downloadBlob } from 'src/app/shared/utils/download-blob.util';
import { SigningDocumentService } from 'src/app/services/signing-document.service';

@Component({
  selector: 'app-court-user-affidavit-grid',
  templateUrl: './court-user-affidavit-grid.component.html',
  styleUrls: ['./court-user-affidavit-grid.component.css']
})

export class CourtUserAffidavitGridComponent implements OnInit {

  courtAffidavitList: CourtAffidavitUserResponse[] = [];
  page = 0;
  size = 15;
  keyword: string;
  sort = 'userAffidavitId';
  order = 'DESC';
  PAGE_SIZE = 15;
  keywordUpdate = new Subject<string>();
  dataMessage = '';
  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 2;
  courtId: number;
  registrarStatus = 'Scheduled';
  prevflag = true;
  nextflag = false;
  countChecked = 0;
  userId: number;

  constructor(private courtDataService: CourtDataService, private signingDocumentService: SigningDocumentService, public dialog: MatDialog, ) {
    this.keywordUpdate.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(() => {
        this.resetPageInfo();
        this.fetchUserAffidavitByCourt();
      });
  }

  ngOnInit() {
    this.registrarStatus = 'Scheduled';
    if (!!localStorage.getItem('userdata')) {
      const userData = JSON.parse(localStorage.getItem('userdata'));
      this.courtId = +userData.courtId;
      this.userId = userData.userId
    }
    this.fetchUserAffidavitByCourt();
  }

  fetchUserAffidavitByCourt() {
    this.courtDataService.getUserAffidavitsByCourtId(this.courtId, this.registrarStatus, this.page, this.size,this.userId,
                                                     this.keyword, this.sort, this.order)
      .subscribe((response: any) => {
        if (response.success) {
          this.courtAffidavitList = response.data;
        }
      });
  }

  sortData(sort: Sort) {
    this.resetPageInfo();
    if (!sort.active || sort.direction === '') {
      sort.active = 'userAffidavitId';
      sort.direction = 'desc';
    }
    this.sort = sort.active;
    this.order = sort.direction.toUpperCase();
    this.fetchUserAffidavitByCourt();
  }

  previousPage() {

    if(this.nextflag){
      this.nextflag = false  ;
    }

    if(this.page > 0){
      this.page--;
      this.dataMessage = "";
      this.courtDataService.getUserAffidavitsByCourtId(this.courtId, this.registrarStatus, this.page, this.size,this.userId,
                                                      this.keyword, this.sort, this.order)
        .subscribe((response: any) => {
          this.courtAffidavitList = this.courtAffidavitList.concat(response.data);
          if (response.data.length === 0 ) {
            this.page++;
            this.dataMessage = '* no more data available ';
            this.prevflag = true;
          }
        }, () => {
          this.page++;
          this.dataMessage = '* no more data available ';
          this.prevflag = true;
        });
    }else{
      this.prevflag = true;
      this.dataMessage = "";
    }
  }

  nextPage() {
    if(this.prevflag == true)
        this.prevflag = false;

    this.page++;
    this.courtDataService.getUserAffidavitsByCourtId(this.courtId, this.registrarStatus, this.page, this.size,this.userId,
                                                     this.keyword, this.sort, this.order)
      .subscribe((response: any) => {
        this.courtAffidavitList = this.courtAffidavitList.concat(response.data);
        if (response.data.length === 0 ) {
          this.page--;
          this.dataMessage = '* no more data available ';
          this.nextflag = true;
        }
      }, () => {
        this.page--;
        this.dataMessage = '* no more data available';
        this.nextflag = true;
      });
  }

  scanBarcode() {
    const dialogRef = this.dialog.open(BarcodeReaderComponent);
    dialogRef.afterClosed()
      .subscribe((data: string) => {
        if (!data || data === 'close') {
          return ;
        } else {
          if (data.startsWith('AID')) {
            const affidavitId = +data.substring(3, data.length);
            this.openAffidavitView(affidavitId);
          } else {
            window.alert('Not a valid barcode!');
          }
        }
      });
  }

  openAffidavitView(affidavitId: number) {
    let currentStatus: any;

    for (let i = 0; i < this.courtAffidavitList.length; i++) {
      if(this.courtAffidavitList[i].userAffidavitId == affidavitId){
        currentStatus = this.courtAffidavitList[i].registrarStatus;
      }
    }

    const dialogRef = this.dialog.open(AffidavtViewComponent, {data: {affidavitId: affidavitId, currenStatus: currentStatus}});
    dialogRef.afterClosed().subscribe((data: string) => {
      if (data === 'close') {

      } else if (data.startsWith('reject ')) {
        for (let i = 0; i < this.courtAffidavitList.length; i++) {
          if(this.courtAffidavitList[i].userAffidavitId == affidavitId){
            this.courtAffidavitList[i].registrarStatus = 'Rejected';
            this.courtAffidavitList[i].registrarComments = data.substring(6, data.length);
          }
        }
      } else if (data.startsWith('done ')) {
        for (let i = 0; i < this.courtAffidavitList.length; i++) {
          if (this.courtAffidavitList[i].userAffidavitId === affidavitId) {
            this.courtAffidavitList.splice(i,1);
          }
        }
      }
    });
  }

  openRegistrarRemarks(affidavit: CourtAffidavitUserResponse) {
    this.openAlertDialogBox('Registrar remarks', affidavit.registrarComments, true);
  }

  openAlertDialogBox(actionNameString: string, messageString: string, onlyCloseFlag): MatDialogRef<AlertdialogComponent> {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {actionname: actionNameString, message: messageString, onlyclose: onlyCloseFlag}
    });
    return dialogRef;
  }

  onChangeFilter() {
    this.resetPageInfo();
    this.fetchUserAffidavitByCourt();
  }

  private resetPageInfo() {
    this.dataMessage = "";
    this.prevflag = true;
    this.nextflag = false;
    this.page = 0;
    this.size = this.PAGE_SIZE;
  }

  addToPending(affidavit:CourtAffidavitUserResponse){
    let affidavitUpdateRequest = new AffidavitStatusUpdateRequest();
    affidavitUpdateRequest.affidavitId = affidavit.userAffidavitId;
    affidavitUpdateRequest.registrarStatus = "Scheduled"

    //update status of affidavit approved by registrar 
    this.courtDataService.updateAffidavitRegistrarStatus(affidavitUpdateRequest).subscribe(data=>{
      this.fetchUserAffidavitByCourt();
      this.openAlertDialogBox('Affidavit Status Changed', "Affidavit Staus changed from Scheduled to Pending.", true); 
      
    },() =>{

    })
  }

  downloadDocument(affidavit: CourtAffidavitUserResponse) {
      if(this.canDownloadSignedDocument(affidavit)){
        const docname = affidavit.isUploaded || affidavit.isCaseRelated ? affidavit.customName : affidavit.temName;
        this.signingDocumentService.downloadSignedDocument(affidavit.userAffidavitId)
          .subscribe(blob => {
            downloadBlob(blob, docname);
          }, error => {
            console.error('Error downloading the file:', error);
          });
      }
  }

  canDownloadSignedDocument(affidavit: CourtAffidavitUserResponse): boolean {
    return affidavit.registrarStatus === "Approved";
  }

}
