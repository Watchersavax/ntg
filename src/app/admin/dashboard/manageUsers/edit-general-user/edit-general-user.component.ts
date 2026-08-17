import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Users } from '../userModels/Users';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UserDataService } from '../UserServices/user-data.service';
import { EditUserDialogComponent } from '../manageUsers.dialog/edit-user-dialog/edit-user-dialog.component';
import { ActiveRole } from '../userModels/ActiveRole';

@Component({
  selector: 'app-edit-general-user',
  templateUrl: './edit-general-user.component.html',
  styleUrls: ['./edit-general-user.component.css']
})
export class EditGeneralUserComponent implements OnInit {

  editUser: FormGroup;
  errormessage = '';
  errorflag = false;
  userModel = new Users();
  activeRole: ActiveRole;
  isAgent: boolean = false;
  isCorporate: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EditUserDialogComponent>,
              private userDataService: UserDataService) {

    this.dialogRef.disableClose = true;
    this.userModel = data.user;
    this.activeRole = data.activeRole;
          ;      
    this.editUser = new FormGroup({
      userName: new FormControl(this.userModel.userName, Validators.required),
      email: new FormControl({value: this.userModel.email, disabled: true}, [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"),]),
      calendlyId: new FormControl(this.userModel.calendlyId),
      firstName: new FormControl(this.userModel.firstName),
      lastName: new FormControl(this.userModel.lastName),
      contact: new FormControl(this.userModel.contact),
      corporateInfo: new FormControl(this.userModel.corporateInfo),
    });

    if(this.userModel.isAgent){
      this.setValidatorsBasedOnType("agent");
    }else if(this.userModel.isCorporate){
      this.setValidatorsBasedOnType("corporate")
    }else{
      this.setValidatorsBasedOnType("individual");
    }

  }

  setValidatorsBasedOnType(type: string) {
    if (type === 'corporate') {
      this.editUser.get('corporateInfo').setValidators([Validators.required]);
      this.editUser.get('firstName').clearValidators();
      this.editUser.get('lastName').clearValidators();
    } else if (type === 'agent' || type === 'individual') {
      this.editUser.get('corporateInfo').clearValidators();
      this.editUser.get('firstName').setValidators([Validators.required]);
      this.editUser.get('lastName').setValidators([Validators.required]);
    }

    this.editUser.get('corporateInfo').updateValueAndValidity();
    this.editUser.get('firstName').updateValueAndValidity();
    this.editUser.get('lastName').updateValueAndValidity();
  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.editUser.status !== 'INVALID') {
      if (this.editUser.controls.userName.value.trim().length > 0) {
        this.userModel.userName = this.editUser.controls.userName.value.trim();
        this.userModel.userName = this.editUser.controls.userName.value.trim();
        this.userModel.email = this.editUser.controls.email.value;
        this.userModel.calendlyId = this.normalizeOptionalValue(this.editUser.controls.calendlyId.value);
        this.userModel.firstName = this.editUser.controls.firstName.value;
        this.userModel.lastName = this.editUser.controls.lastName.value;
        this.userModel.contact = this.editUser.controls.contact.value;
        this.userModel.corporateInfo = this.editUser.controls.corporateInfo.value;

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
      this.editUser.controls['contact'].value.trim().length === 0||
      this.editUser.controls['corporateInfo'].value.trim().length === 0){
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

  private normalizeOptionalValue(value: string): string {
    return value && value.trim().length > 0 ? value.trim() : null;
  }

}
