import { Component, OnInit } from '@angular/core';
import { Loginresponseutil } from 'src/app/shared/models/Loginresponseutil';
import { UserLoginFlagService } from '../userservices/user-login-flag.service';
import { Router } from '@angular/router';
import { NavigationDrawerService } from 'src/app/services/navigation-drawer.service';
import { MatDialog } from '@angular/material';
import { UserUploadAffidavitComponent } from './user-upload-affidavit/user-upload-affidavit.component';
import { PriceInformationDialogComponent } from './price-information-dialog/price-information-dialog.component';
import { UserdataService } from '../userservices/userdata.service';
import { TableRows } from 'src/app/shared/models/TableRows';

@Component({
  selector: 'app-userdashboard',
  templateUrl: './userdashboard.component.html',
  styleUrls: ['./userdashboard.component.css']
})
export class UserdashboardComponent implements OnInit {

  username: string;
  useremail: string;
  userData = new Loginresponseutil();
  toggledrawer = false;
  isAgent ;
  isCorporate:Boolean;
  templateList :TableRows[] = [];

  constructor(private userdataService: UserdataService,private navigationdrawerservice:NavigationDrawerService ,private router: Router, private userLoginFlagService: UserLoginFlagService,private dialog: MatDialog) {
    this.userData = JSON.parse(localStorage.getItem('userdata'));
    this.username = this.userData['displayName'];
    this.useremail = this.userData['email'];
    this.isAgent = this.userData['isAgent'];

    this.isCorporate= JSON.parse(localStorage.getItem('userdata'))['isCorporate'];
    this.isAgent= JSON.parse(localStorage.getItem('userdata'))['isAgent'];

    this.navigationdrawerservice.navigationDrawer.subscribe(data=>{
      this.toggledrawer = data;
    })
  }

  ngOnInit() { }

  loadLoginData() {
    this.userData = JSON.parse(localStorage.getItem('userdata'));
  }

  logout() {
    localStorage.setItem('userdata', '');
    this.userLoginFlagService.setLoggedOffFlag();
    this.router.navigate(['/user/home']);
  }

  closeDrawer(){
      if(this.navigationdrawerservice.flag == true)
      this.navigationdrawerservice.toggleDrawer();
    
  }
    //   ? this.dialog.open(UploadAffidavitAgentComponent, {  disableClose: true })
  openUploadDialog() {
      if(this.isAgent){
        const dialogRef = this.dialog.open(PriceInformationDialogComponent, {
          disableClose: true,
          height: "25rem",
          width: "33rem",
          data: { isAgent: this.isAgent },
        });
      }else{
        const dialogRef = this.dialog.open(UserUploadAffidavitComponent, {
          disableClose: true,
          height: "35rem",
          width: "35rem",
          data: { isAgent: this.isAgent },
        });
      }
      
  }

}
