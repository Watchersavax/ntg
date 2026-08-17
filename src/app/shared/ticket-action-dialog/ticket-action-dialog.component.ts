import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UserDetails } from "src/app/user/user-models/UserDetails";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { UserDataService } from "src/app/admin/dashboard/manageUsers/UserServices/user-data.service";
import { DialogData } from '../models/DialogData';

@Component({
  selector: "app-ticket-action-dialog",
  templateUrl: "./ticket-action-dialog.component.html",
  styleUrls: ["./ticket-action-dialog.component.css"]
})
export class TicketActionDialogComponent implements OnInit {
  dataobj = new DialogData();
  userdata: UserDetails;
  ownerId;
  assigneeId;
  errorflag = false;
  error;
  keywordUpdate = new Subject<string>();
  keyword: string;
  userList = [];
  @ViewChild("searchinput", { static: true }) userinput;
  contactusflag = false;
  actionflag;
  alreadyassignedto: UserDetails = null;

  constructor(
    private el: ElementRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogref: MatDialogRef<TicketActionDialogComponent>,
    private userDataService: UserDataService
  ) {
    dialogref.disableClose = true;
    this.ownerId = data["ownerId"];
    this.assigneeId = data["assignee"];
    this.contactusflag = data["contactus"];
    this.actionflag = data["actionflag"];
    this.alreadyassignedto = data["assignTo"];

    this.keywordUpdate
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(() => {
        this.fetchUserList();
      });

    if (
      !!localStorage.getItem("isAdmin") &&
      localStorage.getItem("isAdmin") == "false"
    ) {
      this.userdata = JSON.parse(localStorage.getItem("userdata"));
    } else {
      this.userdata = JSON.parse(localStorage.getItem("admindata"));
    }

    if (this.contactusflag == true) {
      this.dataobj.actiontype = 2;
    }
  }

  ngOnInit() {}

  fetchUserList() {
    this.userDataService
      .getAllUsersData(0, 0, 0, this.keyword, "userName", "ASC")
      .subscribe((response: any) => {
        if (response.success) {
          this.userList = response.data;
        }
      });
  }

  onSubmit() {
    if (this.actionflag == 0) {
      if (!!this.dataobj.message && this.dataobj.message.trim()) {
        this.dialogref.close(this.dataobj);
      } else {
        this.showErrorMessage("*Please add comments");
        return;
      }
    } else if (this.actionflag == 1) {
      this.assignBackToOwner();
    } else if (this.actionflag == 2) {
      this.assignBackToAssigne();
    } else if (this.actionflag == 3) {
      this.assignBackToOtherUser();
    } else if (this.actionflag == 4) {
      this.resolve();
    }
  }

  resolve() {
    if (!!this.dataobj.message && this.dataobj.message.trim()) {
      this.dataobj.actiontype = 3;
      this.dataobj.assignedTo = this.ownerId;
      this.dialogref.close(this.dataobj);
    } else {
      this.showErrorMessage("*Please add comments");
      return;
    }
  }

  assignBackToOwner() {
    if (!!this.dataobj.message && this.dataobj.message.trim()) {
      this.dataobj.actiontype = 2;
      this.dataobj.assignedTo = this.ownerId;
      this.dialogref.close(this.dataobj);
    } else {
      this.showErrorMessage("*Please add comments");
      return;
    }
  }

  assignBackToAssigne() {
    if (!!this.dataobj.message && this.dataobj.message.trim()) {
      this.dataobj.actiontype = 2;
      this.dataobj.assignedTo = this.assigneeId;
      this.dialogref.close(this.dataobj);
    } else {
      this.showErrorMessage("*Please add comments");
      return;
    }
  }

  assignBackToOtherUser() {
    if (!!this.dataobj.message && this.dataobj.message.trim()) {
      this.dataobj.actiontype = 2;
      
      let findflag = false;

      this.userList.forEach(userdata => {
        
        if (userdata.userName == this.keyword) {
          this.dataobj.assignedTo = userdata.userId;
          findflag = true;
        }
      });

      if (findflag == false) {
        this.showErrorMessage("* Please select a valid user to assign ticket");
        return;
      }

      this.dialogref.close(this.dataobj);
    } else {
      this.showErrorMessage("*Please add comments");
      return;
    }
  }

  close() {
    this.dialogref.close("close");
  }

  showErrorMessage(message) {
    this.error = message;
    this.errorflag = true;
  }

  onKeyenter() {
    this.errorflag = false;
  }
}
