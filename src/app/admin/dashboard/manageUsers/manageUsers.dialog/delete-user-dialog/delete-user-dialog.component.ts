import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CourtDataService } from 'src/app/court/courtdataservices/court-data.service';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';

@Component({
  selector: 'app-delete-user-dialog',
  templateUrl: './delete-user-dialog.component.html',
  styleUrls: ['./delete-user-dialog.component.css']
})
export class DeleteUserDialogComponent implements OnInit {

  message: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<AlertdialogComponent>, private courtDataservice: CourtDataService) {
    dialogRef.disableClose = true;
    this.message = data["message"];
  }

  ngOnInit() { }
}
