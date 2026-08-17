import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-documenso-signing-dialog",
  templateUrl: "./documenso-signing-dialog.component.html",
  styleUrls: ["./documenso-signing-dialog.component.css"],
})
export class DocumensoSigningDialogComponent {
  signingUrl: string;
  name: string;
  email: string;
  allowDocumentRejection = false;

  constructor(
    public dialogRef: MatDialogRef<DocumensoSigningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.signingUrl = data && data.signingUrl;
    this.name = data && data.name;
    this.email = data && data.email;
    this.allowDocumentRejection = !!(data && data.allowDocumentRejection);
  }

  close(result?: string) {
    this.dialogRef.close(result || "Closed");
  }

  documentCompleted() {
    this.close("Completed");
  }

  documentRejected(data: any) {
    this.dialogRef.close({ status: "Rejected", reason: data && data.reason });
  }
}
