import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UserDataService } from '../UserServices/user-data.service';
import { CreateNewUserComponent } from '../manageUsers.dialog/create-new-user/create-new-user.component';
import { Users } from '../userModels/Users';
import { ActiveRole } from '../userModels/ActiveRole';

@Component({
  selector: 'app-create-general-user',
  templateUrl: './create-general-user.component.html',
  styleUrls: ['./create-general-user.component.css']
})
export class CreateGeneralUserComponent implements OnInit {
  createUser: FormGroup;
  errormessage = '';
  errorflag = false;
  roleId: number;
  roleName: string;
  activeRole: ActiveRole;
  isAgent: boolean = false;
  isCorporate: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CreateNewUserComponent>, 
              private userDataService: UserDataService) {
    this.dialogRef.disableClose = true;
    this.createUser = new FormGroup({
      userName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]),
      calendlyId: new FormControl(''),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      contact: new FormControl(''),
      type:new FormControl('individual', Validators.required),
      lasrra: new FormControl("", [
        Validators.pattern("[A-Za-z0-9]*"),
        Validators.maxLength(12),
        Validators.minLength(12),
      ]),
      cac: new FormControl("", [
        Validators.pattern("[A-Za-z0-9]*"),
        Validators.minLength(8),
      ]),
      corporateInfo: new FormControl(""),
    });
    this.roleId = data.roleId;
    this.roleName = data.roleName;
    this.activeRole = data;
  }

  updateValidators(type: string) {
    const firstNameControl = this.createUser.get('firstName');
    const lastNameControl = this.createUser.get('lastName');
    const corporateInfoControl = this.createUser.get('corporateInfo');

    if (type === 'corporate') {
      firstNameControl.clearValidators();
      lastNameControl.clearValidators();
      corporateInfoControl.setValidators([Validators.required]);
    } else {
      firstNameControl.setValidators([Validators.required]);
      lastNameControl.setValidators([Validators.required]);
      corporateInfoControl.clearValidators();
    }

    firstNameControl.updateValueAndValidity();
    lastNameControl.updateValueAndValidity();
    corporateInfoControl.updateValueAndValidity();
  }

  ngOnInit() {

    this.createUser.get('type').valueChanges.subscribe(value => {
      this.updateValidators(value);
      this.clearErrorMessage();
      this.isAgent = value === 'agent';
      this.isCorporate = value === 'corporate'
      if (this.isAgent) {
        this.createUser.get('lasrra').setValidators([Validators.required]);
        this.createUser.get('cac').clearValidators();
      } else if (this.isCorporate) {
        this.createUser.get('cac').setValidators([Validators.required]);
        this.createUser.get('lasrra').clearValidators();
      }
      else {
        this.createUser.get('lasrra').clearValidators();
        this.createUser.get('cac').clearValidators();
      }

      this.createUser.get('lasrra').updateValueAndValidity();
      this.createUser.get('cac').updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.createUser.status !== 'INVALID') {
      let userModel = new Users();
      userModel.active = false;
      userModel.userName = this.createUser.controls.userName.value.trim();
      userModel.email = this.createUser.controls.email.value;
      userModel.calendlyId = this.normalizeOptionalValue(this.createUser.controls.calendlyId.value);
      userModel.firstName = this.createUser.controls.firstName.value;
      userModel.lastName = this.createUser.controls.lastName.value;
      userModel.contact = this.createUser.controls.contact.value;
      userModel.roleId = this.roleId;
      userModel.roleName = this.roleName;
      if(this.createUser.controls.type.value === 'corporate'){
        userModel.isCorporate = true;
        userModel.cacNumber = this.createUser.value["cac"];
        userModel.corporateInfo = this.createUser.controls.corporateInfo.value;
      }
      else if(this.createUser.controls.type.value === 'agent'){
        userModel.isAgent = true;
        userModel.lasrra =this.createUser.value["lasrra"];
      }
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
      this.createUser.controls['email'].value.trim().length === 0){
        this.showErrorMessage('*Please fill required fields.')
      }
      else if (
        (this.createUser.controls['type'].value === 'agent' ||
          this.createUser.controls['type'].value === 'individual') &&
        (this.createUser.controls['firstName'].value.trim().length === 0 ||
          this.createUser.controls['lastName'].value.trim().length === 0)
      ) {
        this.showErrorMessage('*Please fill the first name and last name.');
      } 
      else if(this.createUser.controls['email'].status === 'INVALID' ){
        this.showErrorMessage('Enter valid Email');
      }
      else if(this.createUser.controls['contact'].status === 'INVALID' ){
        this.showErrorMessage('Enter valid Contact');
      }else if (
        this.createUser.controls["type"].value=='agent' &&
        this.createUser.controls["lasrra"].status === "INVALID"
      ) {
        this.showErrorMessage("Please provide your LASRRA Number");
      }
      else if (
        this.createUser.controls["type"].value=='corporate' &&
        this.createUser.controls["cac"].status === "INVALID"
      ) {
        this.showErrorMessage("Please provide your CAC Number");
      }
      else if (
        this.createUser.controls["type"].value=='corporate' &&
        this.createUser.controls['corporateInfo'].value.trim().length === 0
      ) {
        this.showErrorMessage("Please fill the company name.");
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

  keyPressEventLasrra(event: any) {
    const pattern = /^[A-Za-z0-9]*$/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  handlePasteEvent(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData("text");
    const isValid = /^[a-zA-Z0-9]*$/.test(pastedText);
    if (!isValid) {
      event.preventDefault();
      this.createUser.get("lasrra").setValue("");
    }
  }

  clearErrorMessage() {
    this.errormessage = '';
    this.errorflag=false;
  }

  private normalizeOptionalValue(value: string): string {
    return value && value.trim().length > 0 ? value.trim() : null;
  }

}
