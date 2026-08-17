import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Users } from "src/app/admin/dashboard/manageUsers/userModels/Users";
import { UserDataService } from "src/app/admin/dashboard/manageUsers/UserServices/user-data.service";

@Component({
  selector: "app-edit-registrar-user",
  templateUrl: "./edit-registrar-user.component.html",
  styleUrls: ["./edit-registrar-user.component.css"],
})
export class EditRegistrarUserComponent implements OnInit {
  editUser: FormGroup;
  errormessage = "";
  errorflag = false;
  userModel = new Users();
  sessions: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public selectedUser: any,
    public dialogRef: MatDialogRef<EditRegistrarUserComponent>,
    private userDataService: UserDataService
  ) {
    this.dialogRef.disableClose = true;
    this.userModel = selectedUser.data;

    this.editUser = new FormGroup({
      userName: new FormControl(this.userModel.userName, Validators.required),
      email: new FormControl({value: this.userModel.email, disabled: true}, [
        Validators.required,
        Validators.pattern(
          "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
        ),
      ]),
      firstName: new FormControl(this.userModel.firstName, Validators.required),
      lastName: new FormControl(this.userModel.lastName, Validators.required),
      session: new FormControl(this.userModel.sessionId? this.userModel.sessionId.toString() : ""),
      calendlyId: new FormControl(this.userModel.calendlyId),
      contact: new FormControl(this.userModel.contact),
    });
  }

  ngOnInit() {
    this.userDataService.getAllSession().subscribe((response) => {
      this.sessions = response;
      this.sessions = this.sessions.filter((session) => session.isActive);
    });
  }

  onSubmit() {
    if (this.editUser.status != "INVALID") {
      if (this.editUser.controls["userName"].value.trim().length > 0) {
        this.userModel.userName =
          this.editUser.controls["userName"].value.trim();
        this.userModel.userName =
          this.editUser.controls["userName"].value.trim();

        this.userModel.email = this.editUser.controls["email"].value;
        this.userModel.firstName = this.editUser.controls["firstName"].value;
        this.userModel.lastName = this.editUser.controls["lastName"].value;
        this.userModel.contact = this.editUser.controls["contact"].value;
        this.userModel.calendlyId = this.normalizeOptionalValue(this.editUser.controls["calendlyId"].value);
        this.userModel.sessionId = Number(
          this.editUser.controls["session"].value
        );
        // Send post request to update userModel
        this.userDataService
          .saveAndUpdateUserData(this.userModel)
          .subscribe((response) => {
            if (response["success"]) {
              this.dialogRef.close(response["data"]);
            } else {
              this.showErrorMessage(response["error"]["error"]);
            }
          });
      } else {
        return false;
      }
    } else {
      if (
        this.editUser.controls["userName"].value.trim().length === 0 ||
        this.editUser.controls["email"].value.trim().length === 0 ||
        this.editUser.controls["firstName"].value.trim().length === 0 ||
        this.editUser.controls["lastName"].value.trim().length === 0 ||
        this.editUser.controls["contact"].value.trim().length === 0
      ) {
        this.showErrorMessage("*Please fill required fields.");
      } else if (this.editUser.controls["email"].hasError("pattern")) {
        this.showErrorMessage("Enter valid Email");
      } else if (this.editUser.controls["contact"].status === "INVALID") {
        this.showErrorMessage("Enter valid Phone number");
      } else {
        this.showErrorMessage("*Please fill required fields.");
      }
    }
  }

  showErrorMessage(message: any) {
    this.errorflag = true;
    this.errormessage = "" + message;
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
