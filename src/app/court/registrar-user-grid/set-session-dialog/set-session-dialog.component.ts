import { Component, Inject, OnInit } from "@angular/core";
import { UserDataService } from "src/app/admin/dashboard/manageUsers/UserServices/user-data.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
@Component({
  selector: "app-set-session-dialog",
  templateUrl: "./set-session-dialog.component.html",
  styleUrls: ["./set-session-dialog.component.css"],
})
export class SetSessionDialogComponent implements OnInit {
  link: string = "";
  title: string = "";
  editFlag: boolean = false;
  errorFlag: boolean = false;
  constructor(
    private userDataService: UserDataService,
    public dialogRef: MatDialogRef<SetSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public session: any
  ) {}

  ngOnInit(): void {
    if (this.session.data.edit) {
      const data = this.session.data;
      this.title = data.sessionName;
      this.link = data.sessionUrl;
      this.editFlag = true;
    }
  }

  createSession() {
    if(!this.title || !this.link) {
      this.errorFlag = true;
      return
    }
    this.errorFlag = false;
    this.userDataService
      .saveSession(
        {
          sessionName: this.title,
          sessionUrl: this.link,
        },
      )
      .subscribe((response: any) => {
        this.dialogRef.close();
      });
  }

  editSession() {
    if(!this.title || !this.link) {
      this.errorFlag = true;
      return
    }
    this.errorFlag = false;
    
    this.userDataService
      .saveSession(
        {
          sessionName: this.title,
          sessionUrl: this.link,
          sessionId: this.session.data.sessionId,
        },
      )
      .subscribe((response: any) => {
        this.dialogRef.close();
      });
  }

  close() {
    this.dialogRef.close();
  }
}
