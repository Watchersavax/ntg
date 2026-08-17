import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserDataService } from '../../UserServices/user-data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Users } from '../../userModels/Users';
import { ActiveRole } from '../../userModels/ActiveRole';

@Component({
  selector: 'app-create-new-user',
  templateUrl: './create-new-user.component.html',
  styleUrls: ['./create-new-user.component.css']
})
export class CreateNewUserComponent implements OnInit {

  createUser: FormGroup;
  errormessage = '';
  errorflag = false;
  roleId: number;
  roleName: string;
  activeRole: ActiveRole;
  registrarManagement= false;
  userManagement= false;
  templateManagement= false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CreateNewUserComponent>, 
              private userDataService: UserDataService) {
    this.dialogRef.disableClose = true;
    this.createUser = new FormGroup({
      userName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      contact: new FormControl('', Validators.required)
    });
    this.roleId = data.roleId;
    this.roleName = data.roleName;
    this.activeRole = data;
  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.createUser.status !== 'INVALID') {
      let userModel = new Users();
      userModel.active = false;
      userModel.userName = this.createUser.controls.userName.value.trim();
      userModel.email = this.createUser.controls.email.value;
      userModel.firstName = this.createUser.controls.firstName.value;
      userModel.lastName = this.createUser.controls.lastName.value;
      userModel.contact = this.createUser.controls.contact.value;
      userModel.roleId = this.roleId;
      userModel.roleName = this.roleName;
      userModel.registrarManagement= this.registrarManagement;
      userModel.templateManagement = this.templateManagement;
      userModel.userManagement = this.userManagement;

      // Send post request to save userModel
      this.userDataService.saveAndUpdateUserData(userModel)
        .subscribe((response: any) => {
          if (response.success) {
            userModel = response.data;
            this.dialogRef.close(userModel);
          } else {
            let errorMessage = 'Can not be saved right now !';
            if (response.error.status !== '500') {
              errorMessage = response.error.error;
            }
            this.showErrorMessage(errorMessage);
          }
        }, () => {
          this.showErrorMessage('Error! Something went wrong.');
        });
    } else {
      if(this.createUser.controls['userName'].value.trim().length === 0||
      this.createUser.controls['email'].value.trim().length === 0||
      this.createUser.controls['firstName'].value.trim().length === 0||
      this.createUser.controls['lastName'].value.trim().length === 0||
      this.createUser.controls['contact'].value.trim().length === 0){
        this.showErrorMessage('*Please fill required fields.')
      }
      else if(this.createUser.controls['email'].status === 'INVALID' ){
        this.showErrorMessage('Enter valid Email');
      }
      else if(this.createUser.controls['contact'].status === 'INVALID' ){
        this.showErrorMessage('Enter valid Contact');
      }
      else{
      this.showErrorMessage('*Please fill required fields.')
      }
    }
  }

  showErrorMessage(message) {
    this.errorflag = true;
    this.errormessage = message;
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
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
