import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { UploadAffidavitAgentComponent } from '../upload-affidavit-agent/upload-affidavit-agent.component';
import { UserUploadAffidavitComponent } from '../user-upload-affidavit/user-upload-affidavit.component';
import { UserdataService } from '../../userservices/userdata.service';
import { TableRows } from 'src/app/shared/models/TableRows';

@Component({
  selector: 'app-price-information-dialog',
  templateUrl: './price-information-dialog.component.html',
  styleUrls: ['./price-information-dialog.component.css']
})
export class PriceInformationDialogComponent implements OnInit {
  selectedTemplateobj = new TableRows();
  constructor(
    private dialogRef: MatDialogRef<PriceInformationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private dialog:MatDialog, private userdataservice: UserdataService,
  ) {}

  ngOnInit() {
    this.dataInitialization();
  }

  openUploadAffidavit() {
    this.dialogRef.close();
    if (this.data.isAgent) {
      const dialogRef = this.dialog.open(UploadAffidavitAgentComponent, {
        disableClose: true,
        data: { templatePrice: this.selectedTemplateobj.templatePrice,templateFastTrackPrice: this.selectedTemplateobj.templateFastTrackPrice },
      });

      dialogRef.afterClosed().subscribe((result) => {
        // Handle the child dialog result if needed
      });
    } else {
      const dialogRef = this.dialog.open(UserUploadAffidavitComponent, {
        disableClose: true,
        data: { templatePrice: this.selectedTemplateobj.templatePrice,templateFastTrackPrice: this.selectedTemplateobj.templateFastTrackPrice },
      });

      dialogRef.afterClosed().subscribe((result) => {
        // Handle the child dialog result if needed
      });
    }
  }

  dataInitialization(){

    this.userdataservice.fetchTemplateForSystemGenerated().subscribe(data => {
        
        if (data["success"] === true) {
          this.selectedTemplateobj = data["data"];
        }
      },() =>{
      
      });
  }
  close(){
    this.dialogRef.close('Yes');
  }

}
