import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { HttpClient } from '@angular/common/http';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { environment } from 'src/environments/environment';
import { TableRows } from 'src/app/shared/models/TableRows';

@Component({
  selector: "app-delete-template-dialog",
  templateUrl: "./delete-template-dialog.component.html",
  styleUrls: ["./delete-template-dialog.component.css"]
})
export class DeleteTemplateDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: TableRows,
  
  public dialogRef: MatDialogRef<DeleteTemplateDialogComponent>,private http:HttpClient,private loadingservice:LoadingscreenService) {
    dialogRef.disableClose = true;

  }

  ngOnInit() {}

  onSubmit(){
    
        //call backend api to save new version in the database 
        this.http.post(environment.url+"admin/template/deleteTemplate/"+this.data.templateId,{}).subscribe((data)=>{
          
          this.dialogRef.close("Yes");
          },() =>{
          
        });
  }

}
