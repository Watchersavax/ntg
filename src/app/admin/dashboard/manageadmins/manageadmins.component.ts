import { Component, OnInit } from '@angular/core';
import { MatDialog, Sort, MatTabChangeEvent } from '@angular/material';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserDataService } from '../manageUsers/UserServices/user-data.service';
import { CreateNewUserComponent } from '../manageUsers/manageUsers.dialog/create-new-user/create-new-user.component';
import { EditUserDialogComponent } from '../manageUsers/manageUsers.dialog/edit-user-dialog/edit-user-dialog.component';
import { Users } from '../manageUsers/userModels/Users';
import { Loginresponseutil } from 'src/app/shared/models/Loginresponseutil';
import { DeleteUserDialogComponent } from '../manageUsers/manageUsers.dialog/delete-user-dialog/delete-user-dialog.component';
import { ActiveRole } from '../manageUsers/userModels/ActiveRole';
import { SelectorModel } from '../manageUsers/userModels/SelectorModel';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manageadmins',
  templateUrl: './manageadmins.component.html',
  styleUrls: ['./manageadmins.component.css']
})
export class ManageadminsComponent implements OnInit {

  userList: Users[] = [];
  PAGE_SIZE = 15; // default page size
  page = 0;
  size = this.PAGE_SIZE; // current page size
  keyword: string;
  sort = 'createdDate';
  order = 'DESC';
  keywordUpdate = new Subject<string>();
  dataMessage = '';
  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 2;
  infinitescrolldisable = false;
  direction = '';
  stateList: SelectorModel[];
  admindata = new Loginresponseutil();

  selectedIndex = 0;
  tabIndexRoleMap = {
    0: {
      roleId:1,
      roleName: 'ROLE_ADMIN',
      roleDisplayName: 'Admin'
    },
    1: {
      roleId: 3,
      roleName: 'ROLE_STATE_ADMIN',
      roleDisplayName: 'State Admin'
    },
    2: {
      roleId: 4,
      roleName: 'ROLE_REGISTRAR',
      roleDisplayName: 'Registrar'
    }
  };

  activeRole: ActiveRole;

  constructor(private router: Router, private userDataService: UserDataService, public dialog: MatDialog,
              private toastr: ToastrService) {
    // Debounce search
    this.keywordUpdate.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(() => {
        this.resetPageInfo();
        this.fetchUserList();
      });
  }

  ngOnInit() {
    this.activeRole = this.tabIndexRoleMap[this.selectedIndex];
    this.fetchUserList();
    this.admindata = JSON.parse(localStorage.getItem('admindata'));
  }

  fetchUserList() {
    this.userDataService.getAllUsersData(this.activeRole.roleId, this.page, this.size, this.keyword, this.sort, this.order)
      .subscribe((response: any) => {
        if (response.success) {
          this.userList = response.data;
          for (let user of this.userList) {
            // Fetch admin permission for each user
            this.userDataService.getAdminPermissionByUserId(user.userId)
              .subscribe((permissionResponse: any) => {
                if (permissionResponse.success) {
                  user.templateManagement = permissionResponse.data.templateManagement;
                }
              }, (permissionError) => {
                // Handle error for admin permission request
              });
            }
           
        }
      });
  }

  sortData(sort: Sort) {
    this.resetPageInfo();
    if (!sort.active || sort.direction === '') {
      sort.active = 'firstName';
      sort.direction = 'asc';
    }
    this.sort = sort.active;
    this.order = sort.direction.toUpperCase();
    this.fetchUserList();
  }

  createNewUser() {
    const userModel = new Users();
    userModel.roleId = this.activeRole.roleId;
    userModel.roleName = this.activeRole.roleName;
    const dialogRef = this.dialog.open(CreateNewUserComponent, {width:"35vw",data: this.activeRole});
    dialogRef.afterClosed()
      .subscribe((data) => {
        if (!data || data == 'false') {
          return ;
        }
        this.userList.unshift(data);
      });
  }

  editUser(user: Users) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {width:"35vw",data: { user: {...user}, activeRole: this.activeRole}});
    dialogRef.afterClosed().subscribe((response: any) => {
      if (!response || response == 'false') {
        return ;
      }
      user.firstName = response.firstName;
      user.lastName = response.lastName;
      user.userName = response.userName;
      user.email = response.email;
      user.contact = response.contact;
      user.state = response.state;
      user.pincode = response.pincode;
      user.active = response.active;
    });
  }

  onSlide(user: Users) {
    user.active = !user.active;
    this.userDataService.activateOrDeactivateUser(user.userId, user.active)
      .subscribe((response: any) => {
        if (!response.success) {
          user.active = !user.active;
        }
      }, () => {
        user.active = !user.active;
      });
  }

  nextPage() {
    this.page++;
    this.userDataService.getAllUsersData(this.activeRole.roleId, this.page, this.size, this.keyword, this.sort, this.order)
      .subscribe((response: any) => {
        this.userList = this.userList.concat(response.data);
        if (response.data.length === 0 ) {
          this.page--;
          this.dataMessage = '* no data';
          this.infinitescrolldisable = true;
        }
      });
  }

  OnTemplateClick(user: Users) {
    this.router.navigate(['/admin', 'dashboard', 'admins', 'template'],
                          { queryParams: { uid: user.userId, uname: user.userName } });
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.resetPageInfo();
    this.selectedIndex = tabChangeEvent.index;
    this.activeRole = this.tabIndexRoleMap[this.selectedIndex];
    this.fetchUserList();
  }

  private resetPageInfo() {
    this.page = 0;
    this.size = this.PAGE_SIZE;
    this.infinitescrolldisable = false;
  }

  deleteUser(user: Users){
    this.dialog.open(DeleteUserDialogComponent, 
      { data: {  message: "Are you sure you want to delete this user’s profile?", }})
        .afterClosed()
        .subscribe(data => {
          if (data === 'Yes') {
            this.userDataService.deleteUser(user.userId).subscribe(
              (data: any)=>{
                if(data.success){
                  this.fetchUserList();
                  this.toastr.success('User deleted successfully', 'Success');
                } else {
                  this.toastr.error(this.deleteErrorMessage(data), 'Delete failed');
                }
              },
              (error) =>{
                this.toastr.error(this.deleteErrorMessage(error), 'Delete failed');
              }
            )
          }
        });
  }

  private deleteErrorMessage(response: any): string {
    let message = '';
    if (response && response.error && response.error.error && response.error.error.message) {
      message = response.error.error.message;
    } else if (response && response.error && response.error.message) {
      message = response.error.message;
    } else if (response && response.error && response.error.error) {
      message = response.error.error;
    } else if (response && response.message) {
      message = response.message;
    }
    if (this.isTechnicalDeleteError(message)) {
      return 'This user could not be deleted. Please try again or contact support.';
    }
    return message || 'This user could not be deleted. Please try again or contact support.';
  }

  private isTechnicalDeleteError(message: string): boolean {
    return !!message && /hibernate|constraint|sql|exception|could not execute|statement/i.test(message);
  }
}
