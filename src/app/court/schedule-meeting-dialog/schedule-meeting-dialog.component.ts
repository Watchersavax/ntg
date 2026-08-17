import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-schedule-meeting-dialog',
  templateUrl: './schedule-meeting-dialog.component.html',
  styleUrls: ['./schedule-meeting-dialog.component.css']
})
export class ScheduleMeetingDialogComponent implements OnInit {

  startDate = new Date();
  meetingSchedule;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  public dialogRef: MatDialogRef<ScheduleMeetingDialogComponent>) { 
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  close(){
    this.dialogRef.close("close");
  }
}
