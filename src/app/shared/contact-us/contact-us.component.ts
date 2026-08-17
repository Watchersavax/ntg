import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ContactUsAndTicketService } from "src/app/services/contactusandticket.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { TicketCategory } from "../models/TicketCategoryDto";
import { CreateTicketRequest } from "../models/CreateTicketRequest";
import { UserDetails } from "src/app/user/user-models/UserDetails";
import { TicketGridComponent } from '../ticket-grid/ticket-grid.component';
import { TicketDto } from '../models/TicketDto';

@Component({
  selector: "app-contact-us",
  templateUrl: "./contact-us.component.html",
  styleUrls: ["./contact-us.component.css"]
})
export class ContactUsComponent implements OnInit {

  hide = true;
  contactusform: FormGroup;
  errorflag: boolean = false;
  errormessage: string = "";
  ticketCategoryList: TicketCategory[] = [];
  ticketRequest = new CreateTicketRequest();
  userdata = new UserDetails();
  @ViewChild('ticketcomp',{static:true}) child:TicketGridComponent;

  constructor(
    private el: ElementRef,
    private contactusandticketservice: ContactUsAndTicketService
  ) {
    if (localStorage.getItem("isAdmin") == "true" && !!localStorage.getItem("admindata")) {
      this.userdata = JSON.parse(localStorage.getItem("admindata"));
    }else if (localStorage.getItem("isAdmin") == "false" && !!localStorage.getItem("userdata")) {
      this.userdata = JSON.parse(localStorage.getItem("userdata"));
    } 

    this.contactusform = new FormGroup({
      subject: new FormControl("", Validators.required),
      message: new FormControl("", [Validators.required])
    });
  }

  ngOnInit() {
    //fetch TicketCategorylist
    this.contactusandticketservice.getAllTicketCategory().subscribe(
      data => {
        
        if (data["success"] == true) {
          this.ticketCategoryList = data["data"];
        } else {
          this.showErrorMessage("Something went wrong , cant get Subjects ");
          
        }
      },
      () => {
        this.showErrorMessage("Something went wrong , cant get Subjects ");
        
      }
    );

  }

  onSubmit() {
    if (
      this.contactusform.controls["subject"].status === "INVALID" ||
      this.contactusform.controls["message"].status === "INVALID" ||
      this.contactusform.controls["message"].value.trim().length === 0
    ) {
      this.showErrorMessage("Please fill all fields");

      for (const key of Object.keys(this.contactusform.controls)) {
        if (this.contactusform.controls[key].invalid) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + key + '"]'
          );
          invalidControl.focus();
          break;
        }
      }

      return;
    
    } else {
      this.errorflag = false;
      this.ticketRequest.tiId = 0;
      this.ticketRequest.tiown = this.userdata.userId;
      
      this.ticketCategoryList.forEach(category => {
        
        if (category.tcaId == this.contactusform.controls["subject"].value) {
          this.ticketRequest.tica = category;
        }

      });
      
      this.ticketRequest.message = this.contactusform.controls["message"].value.trim();

      this.contactusandticketservice.createTicket(this.ticketRequest).subscribe(
        data => {

          if (data["success"] == true) {
            this.contactusform.reset();
            this.markFormGroupUnTouched(this.contactusform);
            let ticketdto = new TicketDto();
            ticketdto = data["data"];
            
            let dd = new Date(ticketdto.tiCrda);
            let datestring = dd.getDate()+"-"+(dd.getMonth()+1)+"-"+dd.getFullYear()+" "+dd.getHours()+":"+dd.getMinutes()+":"+dd.getSeconds();
            ticketdto.tiCrdast = datestring;
            for(let j=0;j<ticketdto.tiAcLi.length;j++){
              let ddac = new Date(ticketdto.tiAcLi[j].tiAcDate);
              let datestringac = ddac.getDate()+"-"+(ddac.getMonth()+1)+"-"+ddac.getFullYear()+" "+ddac.getHours()+":"+ddac.getMinutes()+":"+ddac.getSeconds();
              ticketdto.tiAcLi[j].tiAcDateSt = datestringac;
            }

            this.child.ticketList.unshift(ticketdto);
            
          } else {
            
            this.showErrorMessage(
              "Something went wrong Please try again " + data["error"]["error"]
            );

          }
        },
        error => {

          this.showErrorMessage(
            "Something went wrong Please try again " + error["error"]
          );

        }
      );
    }
  }

  private markFormGroupUnTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.status = "VALID";
    });
  }

  toggle() {
    this.errorflag = !this.errorflag;
  }

  showErrorMessage(message) {
    this.errorflag = true;
    this.errormessage = "*" + message;
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
