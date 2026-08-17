import { Component, OnInit, ViewChild } from '@angular/core';
import { CourtDashboardService } from '../courtdataservices/court-dashboard.service';
import { RegistrarDashboardResponse } from '../models/RegistrarDashboardDto';
import { RegistrardashboardList } from 'src/app/shared/models/RegistrarDashbaordList';
import * as moment from 'moment';
import { FilterModel } from 'src/app/shared/models/FilterModel';
import { MatDialog, MatDialogRef, MatSort, MatTableDataSource } from '@angular/material';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-registrar-dashboard',
  templateUrl: './registrar-dashboard.component.html',
  styleUrls: ['./registrar-dashboard.component.css']
})
export class RegistrarDashboardComponent implements OnInit {

  mybreakpoint: number |undefined;
  dashboardData: RegistrarDashboardResponse | undefined;
  maxDate = new Date();

  sortedData: RegistrardashboardList[] = [];
  tableList: RegistrardashboardList[] = [];
  prevflag = true;
  nextflag = false;
  dataMessage = '';
  PAGE_SIZE = 20;
  page = 0;
  startDate = new Date();
  endDate = new Date();
  keyword = '';
  selectedFilter: number = 0;
  displayedColumns: string[] = ['date', 'affidavitName', 'affidavitType', 'serialNumber', 'revenue'];
  dataSource = new MatTableDataSource<RegistrardashboardList>(this.tableList);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  userId: number | undefined

  constructor(private courtDashboardService: CourtDashboardService,public dialog: MatDialog,private currencyPipe: CurrencyPipe) { }

  ngOnInit() {
    this.handleSize();
    if (!!localStorage.getItem('userdata')) {
      const userData = JSON.parse(localStorage.getItem('userdata'));
       this.userId = userData.userId;
        this.loadDashboardData();
        this.startDate.setDate(this.startDate.getDate() - 7);
        this.fetchAffidavitList();
    }
  }

  handleSize() {
    this.mybreakpoint = (window.innerWidth > 1024) ? 4 : (window.innerWidth > 600) ? 2 : 2;
  }

  loadDashboardData() {
      this.courtDashboardService.getRegistrarDashboardData(this.userId).subscribe(
        data => {
          this.dashboardData = data;
          
        },
        error => {
          console.error('Error fetching dashboard data', error);
        }
      );
  }

  onFilterChange(value: number): void {
    this.selectedFilter = Number(value);
    switch(Number(value)) {
      case 1:
        this.startDate = moment().startOf('week').toDate();
        this.endDate = moment().endOf('week').toDate();
        break;
      case 2:
        this.startDate = moment().subtract(1, 'weeks').startOf('week').toDate();
        this.endDate = moment().subtract(1, 'weeks').endOf('week').toDate();
        break;
      case 3:
        this.startDate = moment().subtract(1, 'months').startOf('month').toDate();
        this.endDate = moment().subtract(1, 'months').endOf('month').toDate();
        break;
      default:
        
        break;
    }
    this.fetchAffidavitList();
  }

  onKeywordChange(value: string): void {
    this.keyword = value;
    this.fetchAffidavitList();
  }

  fetchAffidavitList() {
    const dataFilterModel = new FilterModel();
    let startDate = moment(this.startDate);
    let startDateFormatted = startDate.format('YYYY-MM-DD');
    let endDate = moment(this.endDate);
    let endDateFormatted = endDate.format('YYYY-MM-DD');
    dataFilterModel.endDate = endDateFormatted;
    dataFilterModel.startDate = startDateFormatted;
    dataFilterModel.keyword = this.keyword.toLocaleLowerCase().trim();
    dataFilterModel.page = this.page;
    dataFilterModel.size = this.PAGE_SIZE;
    dataFilterModel.userId=this.userId
    this.courtDashboardService.getDashbaoardTableList(dataFilterModel).subscribe(response => {
      if (response['success']) {
        this.tableList = response['data'];
        this.sortedData = this.tableList;
        this.dataSource = new MatTableDataSource<RegistrardashboardList>(this.tableList);
        this.dataSource.sort = this.sort;
        
      }
    });
  }

  filterData(event?: any) {
    this.selectedFilter = 0;
    this.page = 0;
    if (this.startDate == null || this.endDate == null) {
      this.openAlertDialogBox('Date Required', "Select Start Date and End Date", true);
    }
    else if (this.startDate > this.endDate) {
      this.openAlertDialogBox('Incorrect Date range', "End Date should be greater than Start Date", true);
    }
    else {
      this.fetchAffidavitList();
      this.prevflag = true;
      this.nextflag = false;
      this.dataMessage = "";
    }
  }

  openAlertDialogBox(actionNameString: string, messageString: string, onlyCloseFlag): MatDialogRef<AlertdialogComponent> {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: { actionname: actionNameString, message: messageString, onlyclose: onlyCloseFlag }
    });
    return dialogRef;
  }

  previousPage() {

    if (this.nextflag) {
      this.nextflag = false;
    }

    if (this.page > 0) {
      this.page--;
      this.dataMessage = "";
      const dataFilterModel = new FilterModel();
      let startDate = moment(this.startDate);
      let startDateFormatted = startDate.format('YYYY-MM-DD');
      let endDate = moment(this.endDate);
      let endDateFormatted = endDate.format('YYYY-MM-DD');
      dataFilterModel.endDate = endDateFormatted;
      dataFilterModel.startDate = startDateFormatted;
      dataFilterModel.keyword = this.keyword.toLocaleLowerCase().trim();
      dataFilterModel.page = this.page;
      dataFilterModel.size = this.PAGE_SIZE;
      dataFilterModel.userId=this.userId
      this.courtDashboardService.getDashbaoardTableList(dataFilterModel)
        .subscribe((response: any) => {
          if (response.data.length === 0) {
            this.page++;
            this.dataMessage = '* no more data available ';
            this.prevflag = true;

          }
          else {
            this.tableList = response['data'];
            this.sortedData = this.tableList;
            this.dataSource = new MatTableDataSource<RegistrardashboardList>(this.tableList);
            this.dataSource.sort = this.sort;
          }

        }, () => {
          this.page++;
          this.dataMessage = '* no more data available ';
          this.prevflag = true;
        });
    } else {
      this.prevflag = true;
      this.dataMessage = "";
    }
  }

  nextPage() {
    if (this.prevflag == true)
      this.prevflag = false;

    this.page++;
    const dataFilterModel = new FilterModel();
    let startDate = moment(this.startDate);
    let startDateFormatted = startDate.format('YYYY-MM-DD');
    let endDate = moment(this.endDate);
    let endDateFormatted = endDate.format('YYYY-MM-DD');
    dataFilterModel.endDate = endDateFormatted;
    dataFilterModel.startDate = startDateFormatted;
    dataFilterModel.keyword = this.keyword.toLocaleLowerCase().trim();
    dataFilterModel.page = this.page;
    dataFilterModel.size = this.PAGE_SIZE;
    dataFilterModel.userId=this.userId
    this.courtDashboardService.getDashbaoardTableList(dataFilterModel)
      .subscribe((response: any) => {

        if (response.data.length === 0) {
          this.page--;
          this.dataMessage = '* no more data available ';
          this.nextflag = true;

        }
        else {
          this.tableList = response['data'];
          this.sortedData = this.tableList;
          this.dataSource = new MatTableDataSource<RegistrardashboardList>(this.tableList);
          this.dataSource.sort = this.sort;
        }

      }, () => {
        this.page--;
        this.dataMessage = '* no more data available';
        this.nextflag = true;
      });
  }

  exportToExcel() {
    if (this.startDate == null || this.endDate == null) {
      this.openAlertDialogBox('Date Required', "Select Start Date and End Date", true);
    }
    else if (this.startDate > this.endDate) {
      this.openAlertDialogBox('Incorrect Date range', "End Date should be greater than Start Date", true);
    }
    else {
      const dataFilterModel = new FilterModel();
      let startDate = moment(this.startDate);
      let startDateFormatted = startDate.format('YYYY-MM-DD');
      let endDate = moment(this.endDate);
      let endDateFormatted = endDate.format('YYYY-MM-DD');
      dataFilterModel.endDate = endDateFormatted;
      dataFilterModel.startDate = startDateFormatted;
      dataFilterModel.keyword = this.keyword.toLocaleLowerCase().trim();
      dataFilterModel.page = this.page;
      dataFilterModel.size = this.PAGE_SIZE;
      dataFilterModel.userId=this.userId
      this.courtDashboardService.exportAffidavitDataToExcel(dataFilterModel).subscribe((response) => {
        this.downLoadFile(response);
      });
    }
  }
  downLoadFile(data: any) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(data);
    a.download = "Affidavits Signed.xlsx";
    // start download
    a.click();

  }

  formatCurrency(amount: number): string {
    const formattedAmount = this.currencyPipe.transform(amount, 'NGN', 'symbol-narrow', '1.0-0');
    if (formattedAmount) {
      return formattedAmount.replace('₦', '₦ ');
    }
    return '';
  }

}
