import { Component, OnInit, SimpleChanges } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Sort } from "@angular/material/sort";
import { CreateRegistrarUserComponent } from "./manageregistrardialogs/create-registrar-user/create-registrar-user.component";
import { EditRegistrarUserComponent } from "./manageregistrardialogs/edit-registrar-user/edit-registrar-user.component";
import { Users } from "src/app/admin/dashboard/manageUsers/userModels/Users";
import { UserDataService } from "src/app/admin/dashboard/manageUsers/UserServices/user-data.service";
import { DeleteUserDialogComponent } from "src/app/admin/dashboard/manageUsers/manageUsers.dialog/delete-user-dialog/delete-user-dialog.component";
import { SetSessionDialogComponent } from "./set-session-dialog/set-session-dialog.component";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-registrar-user-grid",
  templateUrl: "./registrar-user-grid.component.html",
  styleUrls: ["./registrar-user-grid.component.css"],
})
export class RegistrarUserGridComponent implements OnInit {
  categorytosearch: string;
  registrarrolename = "ROLE_REGISTRAR";
  registrarroleId: number = 4;
  showSession: boolean = false;
  userList: Users[] = [];
  sortedData: Users[] = [];
  currentpage = 0;
  pagesize = 10;
  datamessage = "";
  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 2;
  infinitescrolldisable = false;
  direction = "";
  activeRole = 4;
  sessions: any = [];
  keyword: string;
  keywordUpdate = new Subject<string>();
  constructor(
    private router: Router,
    private userDataService: UserDataService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {
    this.keywordUpdate.pipe(debounceTime(800), distinctUntilChanged())
    .subscribe(() => {
      this.fetchUserList();
    });
  }

  ngOnInit() {
    this.fetchUserList();
  }

  fetchUserList() {
    this.userDataService
      .getAllUsersData(this.activeRole, this.currentpage, this.pagesize, this.keyword)
      .subscribe((response) => {
        if (response["success"]) {
          this.userList = response["data"];
          this.sortedData = this.userList;
        }
      });
  }

  sortData(sort: Sort) {
    const data = this.userList.slice();
    if (!sort.active || sort.direction === "") {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "firstName":
          return this.compare(
            a.firstName.toLowerCase(),
            b.firstName.toLowerCase(),
            isAsc
          );
        case "userName":
          return this.compare(
            a.userName.toLowerCase(),
            b.userName.toLowerCase(),
            isAsc
          );
        case "email":
          return this.compare(
            a.email.toLowerCase(),
            b.email.toLowerCase(),
            isAsc
          );
        case "state":
          return this.compare(a.state.stateName, b.state.stateName, isAsc);
        case "pincode":
          return this.compare(a.pincode, b.pincode, isAsc);
        default:
          return 0;
      }
    });
  }

  compare = (a: number | string, b: number | string, isAsc: boolean) => {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  };

  createNewUser() {
    this.showSession = false;
    let userModel = new Users();
    userModel.roleId = this.activeRole;
    userModel.roleName = this.registrarrolename;
    let dialogref = this.dialog.open(CreateRegistrarUserComponent, {
      width: "35vw",
      disableClose: false,
    });
    dialogref.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      this.fetchUserList();
    });
  }

  editUser(user: Users) {
    let dialogref = this.dialog.open(EditRegistrarUserComponent, {
      width: "35vw",
      data: { data: { ...user } },
    });
    dialogref.afterClosed().subscribe((response) => {
      if (response == "false") {
        return;
      }
      this.fetchUserList();
    });
  }

  onSlide(user: Users) {
    user.active = !user.active;
    this.userDataService
      .activateOrDeactivateUser(user.userId, user.active)
      .subscribe(
        (response) => {
          if (response["success"]) {
          } else {
            user.active = !user.active;
          }
        },
        () => {
          user.active = !user.active;
        }
      );
  }

  nextPage() {
    this.currentpage++;
    this.userDataService
      .getAllUsersData(1, this.currentpage, this.pagesize)
      .subscribe((data) => {
        if (data["success"] == true) {
          let dataarray: Users[] = [...data["data"]];
          let temparray: Users[] = [];

          for (let i = 0; i < dataarray.length; i++) {
            let booleanflag = false;
            for (let j = 0; j < this.userList.length; j++) {
              if (this.userList[j].userId == dataarray[i].userId) {
                booleanflag = true;
              }
            }
            if (booleanflag == false) {
              temparray.push(dataarray[i]);
            }
          }

          this.userList.push(...temparray);
          this.sortedData = this.userList;

          if (data["data"].length == 0) {
            this.currentpage--;
            this.datamessage = "* no data";
            this.infinitescrolldisable = true;
          }
        }
      });
  }

  previousPage() {
    this.datamessage = "";
    if (this.currentpage - 1 >= 0) {
      this.currentpage--;
      this.userDataService
        .getAllUsersData(1, this.currentpage, this.pagesize)
        .subscribe((response) => {
          if (response["success"]) {
            this.userList = response["data"];
            this.sortedData = this.userList;
          }
        });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fetchUserList();
  }
  deleteUser(user: Users) {
    this.dialog
      .open(DeleteUserDialogComponent, {
        data: {
          message: "Are you sure you want to delete this user’s profile?",
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === "Yes") {
          this.userDataService.deleteUser(user.userId).subscribe(
            (data: any) => {
              if (data.success) {
                this.fetchUserList();
                this.toastr.success("User deleted successfully", "Success");
              } else {
                this.toastr.error(this.deleteErrorMessage(data), "Delete failed");
              }
            },
            (error) => {
              this.toastr.error(this.deleteErrorMessage(error), "Delete failed");
            }
          );
        }
      });
  }

  OnTemplateClick(user: Users) {
    this.router.navigate(["/admin", "dashboard", "registrars", "affidavit"], {
      queryParams: {
        uid: user.userId,
        uname: user.userName,
        court: user.courtId,
      },
    });
  }

  openSesionDialog() {
    const dialogRef = this.dialog.open(SetSessionDialogComponent, {
      width: "35rem",
      data: { data: { ...{ edit: false } } },
    });
    dialogRef.afterClosed().subscribe((response) => {
      this.loadSession();
    });
  }

  loadSession() {
    this.userDataService.getAllSession().subscribe((response) => {
      this.sessions = response;
      this.showSession = true;
    });
  }

  editSession(session) {
    const dialogRef = this.dialog.open(SetSessionDialogComponent, {
      width: "35rem",
      data: { data: { ...session, edit: true } },
    });
    dialogRef.afterClosed().subscribe((response) => {
      this.loadSession();
    });
  }

  changeSessionStatus(session) {
    session.isActive = !session.isActive;
    this.userDataService
      .editSessionStatus(session)
      .subscribe((response: any) => {
        this.loadSession();
      });
  }

  deleteSession(session) {
    this.dialog
      .open(DeleteUserDialogComponent, {
        data: {
          message: "Are you sure you want to delete this session?",
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === "Yes") {
          this.userDataService.deleteSession(session.sessionId).subscribe(
            (data: any) => {
              if (data.success) {
                this.loadSession();
              } else {
                this.toastr.error(this.deleteSessionErrorMessage(data), "Delete failed");
              }
            },
            (error) => {
              this.toastr.error(this.deleteSessionErrorMessage(error), "Delete failed");
            }
          );
        }
      });
  }

  private deleteErrorMessage(response: any): string {
    return this.extractDeleteErrorMessage(
      response,
      "This user could not be deleted. Please try again or contact support."
    );
  }

  private deleteSessionErrorMessage(response: any): string {
    return this.extractDeleteErrorMessage(
      response,
      "This session could not be deleted. Please try again or contact support."
    );
  }

  private extractDeleteErrorMessage(response: any, fallbackMessage: string): string {
    let message = "";
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
      return fallbackMessage;
    }
    return message || fallbackMessage;
  }

  private isTechnicalDeleteError(message: string): boolean {
    return !!message && /hibernate|constraint|sql|exception|could not execute|statement/i.test(message);
  }
}
