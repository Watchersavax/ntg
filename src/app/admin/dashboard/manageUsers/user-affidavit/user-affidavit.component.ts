import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { UserAffidavit } from 'src/app/user/user-models/UserAffidavit';
import { UserDataService } from '../UserServices/user-data.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { PageParam } from '../../../../shared/models/PageParam';
import { MatDialog } from '@angular/material/dialog';
import { UserAffidavitPaymentDialogComponent } from '../manageUsers.dialog/user-affidavit-payment/user-affidavit-payment-dialog.component';
import { AdminPermission } from '../userModels/AdminPermission';

@Component({
  selector: 'app-user-affidavit',
  templateUrl: './user-affidavit.component.html',
  styleUrls: ['./user-affidavit.component.css']
})

export class UserAffidavitComponent implements OnInit {

  pageParam = new PageParam();
  keywordUpdate = new Subject<string>();
  dataMessage = '';
  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 2;
  infiniteScrollDisabled = false;
  userId: number;
  userName: string;

  userAffidavitList: UserAffidavit[] = [];
  adminManagement=false;
  
  selectedIndex = 0;
  tabIndexAffidavitStatusMap = {
    0: {
      status: 'Pending',
      registrarStatus: 'Pending',
      finalStatus: 'Pending'
    },
    1: {
      status: 'Paid',
      registrarStatus: 'Pending',
      finalStatus: 'Paid'
    },
    2: {
      status: 'Verified',
      registrarStatus: 'Pending',
      finalStatus: 'Verified'
    },
    3: {
      status: 'Verified',
      registrarStatus: 'Approved',
      finalStatus: 'Genuine'
    }
  };
  affidavitStatus = this.tabIndexAffidavitStatusMap[this.selectedIndex];

  constructor(private activeroute: ActivatedRoute, private userDataService: UserDataService, private dialog: MatDialog) {
    let admindata = JSON.parse(localStorage.getItem('admindata'));
    this.userDataService.getAdminPermissionByUserId(admindata.userId) .subscribe((response: any) => {
      if (response.success) {
       let adminPermission = new AdminPermission();
       adminPermission=response.data;
       this.adminManagement=adminPermission.adminManagement;
      } 
    }, () => {
    
    });

    this.keywordUpdate.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.pageParam.reset();
        this.fetchUserAffidavitList();
      });

    this.activeroute.queryParams.subscribe(params => {
      this.userId = params.uid;
      this.userName = params.uname;
      this.fetchUserAffidavitList();
    });
   
  }

  ngOnInit() {
    
    this.affidavitStatus = this.tabIndexAffidavitStatusMap[this.selectedIndex];
  }

  fetchUserAffidavitList() {
    this.userAffidavitList = [];
    this.userDataService
      .getUserAffidavitByStatus(this.userId, this.affidavitStatus.status, this.affidavitStatus.registrarStatus, this.pageParam)
      .subscribe((response: any) => {
        if (response.success) {
          this.userAffidavitList = response.data;
        }
      });
  }

  sortData(sort: Sort) {
    this.pageParam.reset();
    this.infiniteScrollDisabled = false;
    if (!sort.active || sort.direction === '') {
      sort.active = 'templateName';
      sort.direction = 'asc';
    }
    this.pageParam.sort = sort.active;
    this.pageParam.order = sort.direction.toUpperCase();
    this.fetchUserAffidavitList();
  }

  nextPage() {
    this.pageParam.page++;
    this.userDataService
      .getUserAffidavitByStatus(this.userId, this.affidavitStatus.status, this.affidavitStatus.registrarStatus, this.pageParam)
      .subscribe((response: any) => {
        this.userAffidavitList = this.userAffidavitList.concat(response.data);
        if (response.data.length === 0 ) {
          this.pageParam.page--;
          this.dataMessage = '* no data';
          this.infiniteScrollDisabled = true;
        }
      });
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.pageParam.reset();
    this.selectedIndex = tabChangeEvent.index;
    this.affidavitStatus = this.tabIndexAffidavitStatusMap[this.selectedIndex];
    this.fetchUserAffidavitList();
  }

  public markUserAffidavitAsPaid(userAffidavit: UserAffidavit) {
    const dialogRef = this.dialog.open(UserAffidavitPaymentDialogComponent, {data: { userAffidavit: {...userAffidavit}}});
    dialogRef.afterClosed().subscribe((response: any) => {
      if (!response || response == 'false') {
        return ;
      }
     else{
      this.selectedIndex=1;
      this.affidavitStatus = this.tabIndexAffidavitStatusMap[this.selectedIndex];
     }
      this.fetchUserAffidavitList();
    });

  }

}
