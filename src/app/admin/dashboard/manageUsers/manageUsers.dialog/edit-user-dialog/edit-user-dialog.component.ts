import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserDataService } from '../../UserServices/user-data.service';
import { Users } from '../../userModels/Users';
import { AdminPermission } from '../../userModels/AdminPermission';
import { ActiveRole } from '../../userModels/ActiveRole';

@Component({
  selector: 'app-user-state-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})

export class EditUserDialogComponent implements OnInit {

  editUser: FormGroup;
  errormessage = '';
  errorflag = false;
  userModel = new Users();
  activeRole: ActiveRole;
  registrarManagement= false;
  userManagement= false;
  templateManagement= false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EditUserDialogComponent>,
              private userDataService: UserDataService) {

    this.dialogRef.disableClose = true;
    this.userModel = data.user;
    this.activeRole = data.activeRole;

    this.editUser = new FormGroup({
      userName: new FormControl(this.userModel.userName, Validators.required),
      email: new FormControl({value:this.userModel.email, disabled: true}, [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]),
      firstName: new FormControl(this.userModel.firstName, Validators.required),
      lastName: new FormControl(this.userModel.lastName, Validators.required),
      contact: new FormControl(this.userModel.contact)
    });

  }

  ngOnInit() {
    this.userDataService.getAdminPermissionByUserId(this.userModel.userId) .subscribe((response: any) => {
      if (response.success) {
       let adminPermission = new AdminPermission();
       adminPermission=response.data;
       this.registrarManagement=adminPermission.registrarManagement;
       this.templateManagement=adminPermission.templateManagement;
       this.userManagement=adminPermission.userManagement;
      } 
    }, () => {
      this.showErrorMessage('Error! Something went wrong.');
    });

  }

  onSubmit() {
    if (this.editUser.status !== 'INVALID') {
      if (this.editUser.controls.userName.value.trim().length > 0) {
        this.userModel.userName = this.editUser.controls.userName.value.trim();
        this.userModel.userName = this.editUser.controls.userName.value.trim();
        this.userModel.email = this.editUser.controls.email.value;
        this.userModel.firstName = this.editUser.controls.firstName.value;
        this.userModel.lastName = this.editUser.controls.lastName.value;
        this.userModel.contact = this.editUser.controls.contact.value;
        this.userModel.registrarManagement= this.registrarManagement;
        this.userModel.templateManagement = this.templateManagement;
        this.userModel.userManagement = this.userManagement;
        // Send post request to update userModel
        this.userDataService.saveAndUpdateUserData(this.userModel)
          .subscribe((response: any) => {
            if (response.success) {
              this.dialogRef.close(response.data);
            } else {
              let errorMessage = 'Can not Update Details !';
              if (response.error.status !== '500') {
                errorMessage = response.error.error;
              }
              this.showErrorMessage(errorMessage);
            }
          }, () => {
            this.showErrorMessage('Error! Something went wrong.');
          });
      } else {
        return false;
      }
    } else {
      if(this.editUser.controls['userName'].value.trim().length === 0||
      this.editUser.controls['email'].value.trim().length === 0||
      this.editUser.controls['firstName'].value.trim().length === 0||
      this.editUser.controls['lastName'].value.trim().length === 0||
      this.editUser.controls['contact'].value.trim().length === 0){
        this.showErrorMessage('*Please fill required fields.')
      }
      else if(this.editUser.controls['email'].status === 'INVALID' ){
        this.showErrorMessage('Enter valid Email');
      }
      else if(this.editUser.controls['contact'].status === 'INVALID' ){
        this.showErrorMessage('Enter valid Contact');
      }
      else{
      this.showErrorMessage('*Please fill required fields.')
      }
    }
  }

  showErrorMessage(message: any) {
    this.errorflag = true;
    this.errormessage = '' + message;
  }

  keyDownFunction(event: any) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }
  keyPressEvent(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }
}
