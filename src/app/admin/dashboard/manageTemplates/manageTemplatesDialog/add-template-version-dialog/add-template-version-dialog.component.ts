import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { TableRows } from 'src/app/shared/models/TableRows';
import { NewTemplateRequest } from 'src/app/shared/models/NewTemplateRequest';
import { NewTemplateVersionResponse } from 'src/app/shared/models/NewTemplateVersionResponse';
import { NewTemplateVersion } from 'src/app/shared/models/TemplateVersion';

@Component({
  selector: "app-add-template-version-dialog",
  templateUrl: "./add-template-version-dialog.component.html",
  styleUrls: ["./add-template-version-dialog.component.css"]
})
export class AddTemplateVersionDialogComponent
  implements OnInit {
  tablerow:TableRows;
  editformgroup: FormGroup;
  inputcollection;
  versionnames: string[] = [];
  versiondtos:NewTemplateVersion[] = [];
  disableSelect = true;
  errorflag:boolean = false;
  errormessage = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddTemplateVersionDialogComponent>,private http:HttpClient,private loadingservice:LoadingscreenService
  ) {
    
    dialogRef.disableClose = true;
    this.tablerow = data;
    this.editformgroup = new FormGroup({
      templateName: new FormControl(this.tablerow.templateName),
      templateCategoryName: new FormControl(this.tablerow.templateCategory.templateName),
      templatePrice: new FormControl(this.tablerow.templatePrice),
      newversion: new FormControl("", Validators.required)
    });

  }

  ngOnInit() {
    
    this.editformgroup.controls["templateName"].disable();
    this.editformgroup.controls["templateCategoryName"].disable();
    this.editformgroup.controls["templatePrice"].disable();
  }

  onSubmit() {

    if (this.editformgroup.controls["newversion"].status === "VALID" && this.editformgroup.controls["newversion"].value.trim().length >0) {
      let newversionname = this.editformgroup.controls["newversion"].value.trim();
      
      if (this.versionnames.indexOf(newversionname) === -1) {
        
        let newtemplatecreation =new  NewTemplateRequest();
        newtemplatecreation.newTemplateVersionName = this.editformgroup.controls["newversion"].value.trim();
        newtemplatecreation.templateId = this.tablerow.templateId;
        
        //call backend api to save new version in the database 
        this.http.post(environment.url+"admin/template/createNewVersion",newtemplatecreation).subscribe((data:NewTemplateVersionResponse)=>{

          if(data.success === true){
          this.dialogRef.close(data["data"]);
          }
          else{
            this.showErrorMessage(data["error"]["message"]);
            
          }

        },() =>{
          this.showErrorMessage("Error Occured");
          
        });
        
      } 
      else {
        this.showErrorMessage("Version already exist");

      }

    }else{
      this.loadingservice.stopLoading();
      this.showErrorMessage("Please mention Version Name");
    }

  }

  showErrorMessage(message){
    this.errorflag=true;
    this.errormessage = "*"+message;
  }
  
  keyDownFunction(event) {
    if(event.keyCode == 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }

}
