import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CourtDataService } from '../../courtdataservices/court-data.service';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { AffidavitStatusUpdateRequest } from '../../models/AffidavitStatusUpdateRequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CourtConstants } from '../../models/CourtConstants';
import { UserDetails } from 'src/app/user/user-models/UserDetails';
import { TemplateHtmlSanitizerService } from 'src/app/shared/security/template-html-sanitizer.service';

@Component({
  selector: 'app-affidavt-view',
  templateUrl: './affidavt-view.component.html',
  styleUrls: ['./affidavt-view.component.css']
})
export class AffidavtViewComponent implements OnInit {

  courtId;
  useraffidavitId;
  currentstatus ;
  registrarComments:FormGroup;
  errormessage="";
  errorflag=false;
  userdata:UserDetails;
  constantsUtil:CourtConstants = new CourtConstants();
  fetchcourtnamelist:string[] = []
  pdfData:any = "";

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<AffidavtViewComponent>,
  private router : Router,private courtdataservice:CourtDataService,public dialog: MatDialog,
  private templateHtmlSanitizer: TemplateHtmlSanitizerService) {
    
    dialogRef.disableClose = true;
    if(localStorage.getItem("userdata") != null && localStorage.getItem("userdata") != undefined && localStorage.getItem("userdata") != ""){
      this.userdata = JSON.parse(localStorage.getItem("userdata"));
      this.courtId = this.userdata.courtId;
    }

    this.registrarComments = new FormGroup({
      comments: new FormControl("",Validators.required),
    });

  }

  ngOnInit() {
    this.useraffidavitId = this.data["affidavitId"];
    this.currentstatus = this.data["currenStatus"];
    //fetch affidavit html from db using affidavit id 
    this.courtdataservice.getAffidavitHtmlValueByCourtAndAffidavitId(this.useraffidavitId,this.courtId).subscribe(data=>{

    if(data["success"] == true){
      
      this.templateHtmlSanitizer.replaceContent(
        document.getElementById("templatePreview"),
        JSON.parse(data["data"]["htmlValue"])
      );
      this.currentstatus = data["data"]["registrarStatus"];
      if (data["data"]["pdfData"]) {
        const byteCharacters = atob(data["data"]["pdfData"]);
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
    }else{
      let namelist = data["error"]["error"].substring(data["error"]["error"].indexOf('[')+1,data["error"]["error"].indexOf(']'));
      this.fetchcourtnamelist = namelist.split(',');
      this.openAlertDialogBox("Action Not Allowed!","You are not allowed to verify this affidavit. User can approve this affidavit from any of below-listed courts. <#b>Reason : This affidavit doesn't belong to your court. ",this.fetchcourtnamelist,true);
      this.dialogRef.close("close");
    }
  },() =>{
    this.openAlertDialogBox("No Affidavits","Not a valid affidavit Id",null,true);
    this.dialogRef.close("close");
  })

  }

  reject(){
    
    if(this.registrarComments.controls["comments"].value.trim().length > 0){
      this.updateStatusOfAffidavit(this.constantsUtil.REGISTRAR_STATUS_REJECTED ,this.registrarComments.controls["comments"].value.trim());
      this.dialogRef.close('reject '+this.registrarComments.controls["comments"].value.trim());
    }else{
      this.registrarComments.controls['comments'].markAsDirty();
      this.showErrorMessage();
      //show error message 
      return;
    }
  }

  updateStatusOfAffidavit(status,message){

    let affidavitUpdateRequest = new AffidavitStatusUpdateRequest();
    affidavitUpdateRequest.affidavitId = this.useraffidavitId;
    affidavitUpdateRequest.courtId = this.courtId;
    affidavitUpdateRequest.registrarStatus = status
    affidavitUpdateRequest.registrarComment = message;
    affidavitUpdateRequest.registrarId = this.userdata.userId;

    //update status of affidavit approved by registrar 
    this.courtdataservice.updateAffidavitRegistrarStatus(affidavitUpdateRequest).subscribe(data=>{

    },() =>{

    })

    //then send data to grid
  }

  openAlertDialogBox(actionnamestrign,messagestring,courtList,onlycloseflag):MatDialogRef<AlertdialogComponent>{
    let dialogref = this.dialog.open(AlertdialogComponent, {
      "data": {actionname:actionnamestrign,message:messagestring,onlyclose:onlycloseflag,courtList:courtList}
    });
    return dialogref;
  }

  showErrorMessage(){
    this.errorflag = true;
    this.errormessage = "*Please mention reason for rejecting the template ";
  }
}
