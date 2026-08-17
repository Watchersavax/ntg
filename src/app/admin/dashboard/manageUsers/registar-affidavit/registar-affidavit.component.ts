import { Component, OnInit } from '@angular/core';
import { MatDialog, Sort, MatDialogRef } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AffidavtViewComponent } from 'src/app/court/court-user-affidavit-grid/affidavt-view/affidavt-view.component';
import { CourtDataService } from 'src/app/court/courtdataservices/court-data.service';
import { CourtAffidavitUserResponse } from 'src/app/court/models/CourtAffidavitUserResponse';
import { AffidavitStatusUpdateRequest } from 'src/app/court/models/AffidavitStatusUpdateRequest';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { PageParam } from 'src/app/shared/models/PageParam';
import { downloadBlob } from 'src/app/shared/utils/download-blob.util';
import { SigningDocumentService } from 'src/app/services/signing-document.service';

@Component({
  selector: 'app-registar-affidavit',
  templateUrl: './registar-affidavit.component.html',
  styleUrls: ['./registar-affidavit.component.css']
})
export class RegistarAffidavitComponent implements OnInit {

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
  registrarStatus = 'Approved';
  prevflag = true;
  nextflag = false;
  countChecked = 0;
  userId: number;
  userName: string;
  pageParam = new PageParam();

  constructor(private courtDataService: CourtDataService, private signingDocumentService: SigningDocumentService, public dialog: MatDialog, private activeroute: ActivatedRoute) {
    
      this.keywordUpdate.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.pageParam.reset();
        this.fetchUserAffidavitByCourt();
      });

    this.activeroute.queryParams.subscribe(params => {
      this.userId = params.uid;
      this.userName = params.uname;
      this.courtId=params.court
      this.fetchUserAffidavitByCourt();
    });
  }

  ngOnInit() {
    this.registrarStatus = 'Approved';
    this.fetchUserAffidavitByCourt();
  }

  fetchUserAffidavitByCourt() {
    this.courtDataService.getUserAffidavitsByCourtIdAndUserId(this.courtId, this.userId,this.page, this.size,
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
      this.courtDataService.getUserAffidavitsByCourtIdAndUserId(this.courtId, this.userId,this.page, this.size,
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
    this.courtDataService.getUserAffidavitsByCourtIdAndUserId(this.courtId, this.userId,this.page, this.size,
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

  downloadDocument(affidavitId: number, docname: string) {
    this.signingDocumentService.downloadSignedDocument(affidavitId)
      .subscribe(blob => {
        downloadBlob(blob, docname);
      }, error => {
      });
  }

  checkBoxChange(affidavit: CourtAffidavitUserResponse, checked: boolean, event: any) {
    this.countChecked += checked ? 1 : -1;
  }

  addToPending(affidavit: CourtAffidavitUserResponse) {
    const affidavitUpdateRequest = new AffidavitStatusUpdateRequest();
    affidavitUpdateRequest.affidavitId = affidavit.userAffidavitId;
    affidavitUpdateRequest.registrarStatus = 'Scheduled';
    this.courtDataService.updateAffidavitRegistrarStatus(affidavitUpdateRequest).subscribe(() => {
      this.fetchUserAffidavitByCourt();
      this.openAlertDialogBox('Affidavit Status Changed', 'Affidavit Staus changed from Scheduled to Pending.', true);
    }, () => {
    });
  }

}
