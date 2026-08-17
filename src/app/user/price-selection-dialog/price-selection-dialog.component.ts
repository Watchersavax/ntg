import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-price-selection-dialog',
  templateUrl: './price-selection-dialog.component.html',
  styleUrls: ['./price-selection-dialog.component.css']
})
export class PriceSelectionDialogComponent implements OnInit {
  isExpress: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PriceSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
  }

  selectOption(isFastTrack: boolean): void {
    this.isExpress = isFastTrack;
    this.dialogRef.close({ isExpress: this.isExpress });
  }
  
  onClose(): void {
    this.dialogRef.close('close');
  }

}
