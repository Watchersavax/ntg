import { Component, OnInit, Input } from "@angular/core";
import { UserDetails } from "src/app/user/user-models/UserDetails";
import { TicketDto } from "../models/TicketDto";
import { ContactUsAndTicketService } from "src/app/services/contactusandticket.service";
import { HttpParams } from "@angular/common/http";
import { Sort } from "@angular/material/sort";
import { TicketActionDto } from "../models/TicketActionDto";
import { MatDialog } from "@angular/material/dialog";
import { TicketActionDialogComponent } from "../ticket-action-dialog/ticket-action-dialog.component";

@Component({
  selector: "app-ticket-grid",
  templateUrl: "./ticket-grid.component.html",
  styleUrls: ["./ticket-grid.component.css"]
})
export class TicketGridComponent implements OnInit {
  @Input() contactus;
  userdata = new UserDetails();
  ticketList: TicketDto[] = [];
  currentpage = 0;
  pagesize = 15;
  typeahead;
  sort = "ticketCreationdate";
  order = "DESC";
  httpParams;
  dataMessage;
  notickets = false;
  contactusflag = false;
  activeStatusTab = "Assigned";
  sortedData: TicketDto[] = [];
  prevflag = true;
  nextflag = false;

  constructor(
    private contactusandticketservice: ContactUsAndTicketService,
    private dialog: MatDialog
  ) {
    if (
      !!localStorage.getItem("isAdmin") &&
      localStorage.getItem("isAdmin") == "false"
    ) {
      this.userdata = JSON.parse(localStorage.getItem("userdata"));
    } else {
      this.userdata = JSON.parse(localStorage.getItem("admindata"));
    }
  }

  ngOnInit() {
    if (
      this.contactus == null ||
      this.contactus == undefined ||
      this.contactus == false
    ) {
      this.contactusflag = false;
    } else {
      this.contactusflag = this.contactus;
    }

    this.fetchTicketList(false,"");
  }

  nextPage() {

    if(this.prevflag == true)
        this.prevflag = false;

    this.currentpage++;
    this.fetchTicketList(true,"forward");

  }

  previousPage() {
    if(this.nextflag){
      this.nextflag = false;
    }

    if (this.currentpage > 0) {
      this.currentpage--;
      this.fetchTicketList(true,"backward");
     
    } else {
      this.dataMessage = "";
      this.prevflag = true;
    }

    if(this.currentpage == 0){
      this.prevflag = true;
    }
  }

  fetchTicketList(paginationflag,move) {

    if (paginationflag == false) {
      this.currentpage = 0;
    }

    this.createHttpParams();
    this.contactusandticketservice
      .getAllTicketsByUserId(
        this.userdata.userId,
        this.httpParams,
        this.userdata.roleId,
        this.contactusflag
      )
      .subscribe(
        data => {
          if (data["success"] == true) {
            
            if (paginationflag == true && data["data"].length == 0) {
              this.dataMessage = "*No more data";
              this.ticketList = [];
              this.disablePaginator(move);

            } else {
              this.dataMessage = "";
              this.ticketList = data["data"];

              this.parseDateString();

              if (this.contactusflag == false) {
                for (let i = 0; i < this.ticketList.length; i++) {
                  if (this.ticketList[i].tiOwId == this.userdata.userId) {
                    this.ticketList.splice(i, 1);
                  }
                }
              }
              this.notickets = false;
            }
            
          } else {
           
            if (paginationflag == true) {
              this.dataMessage = "*No more data";
              this.disablePaginator(move);
            } else {
              this.dataMessage = "";
              this.ticketList = [];
              this.notickets = true;
            }
          }
        },
        () => {}
      );
  }

  disablePaginator(move){
    
    if(move == "forward"){
      this.nextflag = true;
      this.currentpage--;

    }else if(move == "backward"){
      this.prevflag = true;
      
    }
  }

  parseDateString(){
    for(let i=0;i<this.ticketList.length;i++){

      let dd = new Date(this.ticketList[i].tiCrda);
      let datestring = dd.getDate()+"-"+(dd.getMonth()+1)+"-"+dd.getFullYear()+" "+dd.getHours()+":"+dd.getMinutes()+":"+dd.getSeconds();
      this.ticketList[i].tiCrdast = datestring;
      for(let j=0;j<this.ticketList[i].tiAcLi.length;j++){
        let ddac = new Date(this.ticketList[i].tiAcLi[j].tiAcDate);
        let datestringac = ddac.getDate()+"-"+(ddac.getMonth()+1)+"-"+ddac.getFullYear()+" "+ddac.getHours()+":"+ddac.getMinutes()+":"+ddac.getSeconds();
        this.ticketList[i].tiAcLi[j].tiAcDateSt = datestringac;
      }
    
    }

  }

  takeActionOnTicket(flag, ticketaction: TicketActionDto, ticket: TicketDto) {
    //open dialog to take input of information
    this.dialog
      .open(TicketActionDialogComponent, {
        data: {
          ownerId: ticket.tiOwId,
          assignee: ticketaction.tiAssBy,
          contactus: this.contactusflag,
          actionflag: flag,
          assignTo: ticketaction.tiAssToDe
        }
      })
      .afterClosed()
      .subscribe(
        data => {
          if (data != "close" && data != undefined) {
            let requestticketaction = new TicketActionDto();

            //updating assignment in case of super admin action
            if (
              this.userdata.roleId == 1 &&
              ticketaction.tiActTy != 3 &&
              ticketaction.tiAssTo != null &&
                ticketaction.tiAssTo != this.userdata.userId
            ) {
              requestticketaction.tiActId = ticketaction.tiActId;
            } else {
              requestticketaction.tiActId = 0;
            }
            requestticketaction.tiActTy = data.actiontype;
            requestticketaction.tiMes = data.message;
            requestticketaction.tiAssBy = this.userdata.userId;

            if (this.contactusflag == true) {
              requestticketaction.tiAssTo = ticketaction.tiAssBy;
            } else {
              requestticketaction.tiAssTo = data.assignedTo;
            }

            requestticketaction.tiId = ticketaction.tiId;

            this.contactusandticketservice
              .takeActionOnTicket(requestticketaction, this.userdata.roleId)
              .subscribe(
                data => {
                  this.fetchTicketList(false,"");
                  
                },
                () => {}
              );
          }
        },
        () => {}
      );
  }

  createHttpParams() {
    this.httpParams = new HttpParams()
      .set("page", this.currentpage.toString())
      .set("size", this.pagesize.toString())
      .set("keyword", !!this.activeStatusTab ? this.activeStatusTab : "")
      .set("sort", !!this.sort ? this.sort : "ticketCreationdate")
      .set("order", !!this.order ? this.order : "DESC");
  }

  onStatusChange(statusTab: string) {
    this.activeStatusTab = statusTab;
    this.sort = "";
    this.order = "";
    this.putValuesBackToDefault();
    this.fetchTicketList(false,"");
  }

  sortData(sort: Sort) {
    const data = this.ticketList.slice();

    if (!sort.active || sort.direction === "") {
      this.sortedData = data;
      return;
    }
    this.sort = !!sort.active ? sort.active : "ticketCreationdate";
    this.order = !!sort.direction ? sort.direction.toUpperCase() : "DESC";

    this.putValuesBackToDefault();
    this.createHttpParams();
    this.fetchTicketList(false,"");
  }

  putValuesBackToDefault() {
    this.dataMessage = "";
    this.prevflag = true;
    this.nextflag = false;
    this.pagesize = 15;
    this.currentpage = 0;
  }
}
