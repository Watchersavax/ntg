import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";

import { UserDataService } from "src/app/admin/dashboard/manageUsers/UserServices/user-data.service";
import { Users } from "src/app/admin/dashboard/manageUsers/userModels/Users";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-create-registrar-user",
  templateUrl: "./create-registrar-user.component.html",
  styleUrls: ["./create-registrar-user.component.css"],
})
export class CreateRegistrarUserComponent implements OnInit {
  createUser: FormGroup;
  errormessage = "";
  errorflag = false;
  roleId: number = 4;
  roleName: string = "ROLE_REGISTRAR";
  showImport = false;
  sessions: any = [];
  user: Users;

  constructor(
    public dialogRef: MatDialogRef<CreateRegistrarUserComponent>,
    private userDataService: UserDataService,
    private toastr: ToastrService
  ) {
    this.createUser = new FormGroup({
      userName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      session: new FormControl('1'),
      calendlyId: new FormControl(''),
      contact: new FormControl('', Validators.required)
  })
}

  ngOnInit() {
    this.userDataService.getAllSession().subscribe((response) => {
      this.sessions = response;
      this.sessions = this.sessions.filter(session => session.isActive);
    });
  }

  onSubmit() {

    if(this.createUser.status != 'INVALID'){
    let userModel = new Users();

    userModel.active = false;
    userModel.userName = this.createUser.controls["userName"].value.trim();
    userModel.email = this.createUser.controls["email"].value;
    userModel.firstName = this.createUser.controls["firstName"].value;
    userModel.lastName = this.createUser.controls["lastName"].value;
    userModel.sessionId = Number(this.createUser.controls["session"].value);
    userModel.calendlyId = this.normalizeOptionalValue(this.createUser.controls["calendlyId"].value);
    userModel.contact = this.createUser.controls["contact"].value;
    userModel.roleId = this.roleId;
    userModel.roleName = this.roleName;

    // Send post request to save userModel
    this.userDataService.saveAndUpdateUserData(userModel).subscribe((response) => {
      if (response['success']) {
        userModel = response['data'];
        this.dialogRef.close(userModel);
      } else {
        this.showErrorMessage(response["error"]["error"]);
      }
    }, () => {
      this.showErrorMessage('Cant be saved right now !');
    })
  }else{
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
      this.showErrorMessage('Enter valid Phone number');
    }
    else{
    this.showErrorMessage('*Please fill required fields.')
    }
  }
  }

  onImport() {
    this.userDataService.saveAndUpdateUserData(this.user).subscribe(
      (response) => {
        if (response["success"]) {
          this.toastr.success("New Registrar onboard successfully", "Success");
          this.dialogRef.close(response["data"] as Users);
        } else {
          this.toastr.error("Something went wrong", "Error");
        }
      },
      () => {
        this.toastr.error("Cant be saved right now !", "Error");
      }
    );
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

  private normalizeOptionalValue(value: string): string {
    return value && value.trim().length > 0 ? value.trim() : null;
  }
}
