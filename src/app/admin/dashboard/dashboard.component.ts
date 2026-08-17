import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { Loginresponseutil } from 'src/app/shared/models/Loginresponseutil';
import { UserDataService } from './manageUsers/UserServices/user-data.service';
import { AdminPermission } from './manageUsers/userModels/AdminPermission';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  admindata = new Loginresponseutil();
  admindisplayname: string;
  registrarManagement= false;
  userManagement= false;
  templateManagement= false;
  adminManagement=false;
  categoriesManagement=false;

  constructor(private route: Router, private userDataService: UserDataService  ) {

    if (localStorage.getItem('isAdmin') && localStorage.getItem('isAdmin') == 'true' && localStorage.getItem('admindata')) {
      this.loadLoginData();
      this.admindisplayname = this.admindata.displayName;
    } else {
      this.route.navigate(['/user/home']);
    }

  }

  ngOnInit() {
    this.userDataService.getAdminPermissionByUserId(this.admindata.userId) .subscribe((response: any) => {
      if (response.success) {
       let adminPermission = new AdminPermission();
       adminPermission=response.data;
       this.registrarManagement=adminPermission.registrarManagement;
       this.templateManagement=adminPermission.templateManagement;
       this.userManagement=adminPermission.userManagement;
       this.adminManagement=adminPermission.adminManagement;
       this.categoriesManagement=adminPermission.categoriesManagement;
      } 
    }, () => {
    
    });

  }

  goToDashboard() {
    this.route.navigate(['/admin', 'dashboard', 'templates']);
  }

  changePersonalDetails() {
    this.route.navigate(['/admin', 'dashboard', 'personal']);
  }

  changePassword() {
    this.route.navigate(['/admin', 'dashboard', 'passreset']);
  }

  logout() {
    localStorage.setItem('admindata', '');
    localStorage.setItem('isAdmin', 'false');
    this.route.navigate(['/user/home']);
  }

  goToContact() {
    this.route.navigate(['/admin', 'dashboard', 'contactus']);
  }

  loadLoginData() {
    this.admindata = JSON.parse(localStorage.getItem('admindata'));
  }
}
