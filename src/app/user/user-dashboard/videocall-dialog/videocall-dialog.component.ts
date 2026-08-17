import { AfterViewInit, Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
  selector: "app-videocall-dialog",
  templateUrl: "./videocall-dialog.component.html",
  styleUrls: ["./videocall-dialog.component.css"],
})
export class VideocallDialogComponent implements OnInit, AfterViewInit {
  embeddedSigningUrl: string;

  templateId;
  templateprice;
  useraffidavitId;
  templateName;
  templatecustomname;
  actualdocumentname;

  affidavitprice;
  affidavitId;
  documentname;
  templateValue;
  meetingId;
  meetingTiming;
  meetingUrl: string;
  pdfData:any = "";
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<VideocallDialogComponent>
  ) {
    dialogRef.disableClose = true;
    this.templateValue = JSON.parse(this.data["userAffidavitObj"]["htmlValue"]);
    if (this.data["userAffidavitObj"]["pdfData"]) {
      const byteCharacters = atob(this.data["userAffidavitObj"]["pdfData"]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
  
      const reader = new FileReader();
  
      reader.onloadend = () => {
          const base64data = reader.result as string;
          this.pdfData = base64data; // Set the source for the PDF viewer
      };
      reader.readAsDataURL(blob);
      
    }
  }
  ngAfterViewInit(): void {
    if (this.templateValue) {
      let htmlstring = this.templateValue;
      document.getElementById("templatePreview").innerHTML = htmlstring;
    }

    this.meetingUrl = this.data["meetingUrl"];
    
  }

  ngOnInit() {
    this.templateName = this.data["userAffidavitObj"]["templateName"];
    this.templatecustomname =
      this.data["userAffidavitObj"]["userAffidavitCustomName"];
    this.meetingId = this.data["meetingId"];
    this.meetingTiming = this.data["meetingTiming"];

    if (this.templatecustomname == undefined || this.templatecustomname == "") {
      this.actualdocumentname = this.templateName;
    } else {
      this.actualdocumentname = this.templatecustomname;
    }

    this.useraffidavitId = this.data["userAffidavitObj"]["useraffidavitId"];
    this.affidavitprice = this.data["userAffidavitObj"]["price"];
    this.affidavitId = this.useraffidavitId;
    this.documentname = this.actualdocumentname;

  }
  onClosePopup() {
    this.dialogRef.close();
  }

  joinMeeting() {
    window.open(this.meetingUrl, "_blank");
  }
}
