import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { UserdataService } from '../userservices/userdata.service';
import { Deponent } from '../user-models/Deponent';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';

@Component({
  selector: 'app-deponent',
  templateUrl: './deponent.component.html',
  styleUrls: ['./deponent.component.css']
})
export class DeponentComponent implements OnInit {

  deponentFormGroup: FormGroup;
  errorFlag = false;
  errorMessage = '';
  deponent = new Deponent();
  agentId: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeponentComponent>,
    public userDataService: UserdataService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.agentId = this.data["agentId"];
    this.deponentFormGroup = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]),
      mobile: new FormControl('',)
    });

  }

  onSubmit() {
    if (this.deponentFormGroup.controls['firstname'].status === 'INVALID' ||
      this.deponentFormGroup.controls['lastname'].status === 'INVALID' ||
      this.deponentFormGroup.controls['email'].status === 'INVALID' ||
      this.deponentFormGroup.controls['mobile'].status === 'INVALID' ||
      this.deponentFormGroup.controls['firstname'].value.trim().length === 0 ||
      this.deponentFormGroup.controls['lastname'].value.trim().length === 0
    ) {
      if (this.deponentFormGroup.controls['email'].status === 'INVALID') {
        this.showErrorMessage('Enter valid email');
      }
      else if (this.deponentFormGroup.controls['mobile'].status === 'INVALID') {
        this.showErrorMessage('Enter valid mobile');
      }
      else {
        this.showErrorMessage('Enter all mandatory fields');
      }

    }
    else {
      this.deponent.agentId = this.agentId;
      this.deponent.firstName = this.deponentFormGroup.value['firstname'];
      this.deponent.lastName = this.deponentFormGroup.value['lastname'];
      this.deponent.email = this.deponentFormGroup.value['email'];
      this.deponent.mobile = this.deponentFormGroup.value['mobile'];
      this.saveDeponentDetails();
    }
  }
  saveDeponentDetails() {
    this.userDataService.saveADeponentData(this.deponent)
      .subscribe(
        (reponse: any) => {
          if (reponse.success) {
            this.deponent = reponse.data;
            this.dialogRef.close(this.deponent.deponentId);
          }
          else {
            this.showErrorMessage('Something went wrong!');
          }
        },
        () => {

          this.showErrorMessage('Something went wrong!');
        }
      )
  }
  close() {
    this.dialogRef.close('Close');
  }

  keyPressEvent(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }
  showErrorMessage(message: string) {
    this.errorFlag = true;
    this.errorMessage = '*' + message;
  }
  togglewithmessage(message: string) {
    this.errorFlag = !this.errorFlag;
    this.errorMessage = '' + message;
  }
  openAlertDialogBox(actionNameString: string, messageString: string, onlyCloseFlag): MatDialogRef<AlertdialogComponent> {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: { actionname: actionNameString, message: messageString, onlyclose: onlyCloseFlag }
    });
    return dialogRef;
  }
}
