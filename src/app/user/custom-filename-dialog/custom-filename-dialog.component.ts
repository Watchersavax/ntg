import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-filename-dialog',
  templateUrl: './custom-filename-dialog.component.html',
  styleUrls: ['./custom-filename-dialog.component.css']
})
export class CustomFilenameDialogComponent implements OnInit {

  affidavitname;

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogref: MatDialogRef<CustomFilenameDialogComponent>) {
    dialogref.disableClose = true;
   }

  ngOnInit() {
    if (this.data && this.data.affidavitname) {
      this.affidavitname = this.data.affidavitname;
    }
  }

  close(){
    this.dialogref.close("close");
  }
}
