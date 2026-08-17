import { Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

import { AlertdialogComponent } from "../shared/alertdialog/alertdialog.component";
import { DocumensoSigningDialogComponent } from "../shared/documenso-signing-dialog/documenso-signing-dialog.component";
import { SigningDocumentService } from "./signing-document.service";

export interface UserSigningDialogOptions {
  affidavitId: number;
  dialog?: MatDialog;
  name?: string;
  email?: string;
  allowDocumentRejection?: boolean;
  openErrorMessage?: string;
  onSignedOrRejected?: (result: any) => void;
  onClosed?: () => void;
}

@Injectable({
  providedIn: "root",
})
export class SigningDialogService {
  private readonly defaultOpenErrorMessage = "Unable to open document for signing.";

  constructor(
    private dialog: MatDialog,
    private signingDocumentService: SigningDocumentService
  ) {}

  openUserSigning(options: UserSigningDialogOptions): Promise<any> {
    return this.signingDocumentService
      .getUserSigningEmbed(options.affidavitId)
      .then((data) => {
        if (!data || !data.signingUrl) {
          throw new Error(options.openErrorMessage || this.defaultOpenErrorMessage);
        }
        return this.openDialog(data.signingUrl, options);
      })
      .catch((error) => {
        this.showSigningDialogOpenError(options.openErrorMessage || this.defaultOpenErrorMessage, error, options);
        if (options.onClosed) {
          options.onClosed();
        }
        throw error;
      });
  }

  private openDialog(signingUrl: string, options: UserSigningDialogOptions): Promise<any> {
    const dialog = options.dialog || this.dialog;
    const dialogRef: MatDialogRef<DocumensoSigningDialogComponent> =
      dialog.open(DocumensoSigningDialogComponent, {
        disableClose: true,
        closeOnNavigation: false,
        data: {
          signingUrl: signingUrl,
          name: options.name,
          email: options.email,
          allowDocumentRejection: options.allowDocumentRejection,
        },
      });

    return new Promise<any>((resolve) => {
      dialogRef.afterClosed().subscribe((result) => {
        if (this.isSignedOrRejected(result) && options.onSignedOrRejected) {
          options.onSignedOrRejected(result);
        }
        if (options.onClosed) {
          options.onClosed();
        }
        resolve(result);
      });
    });
  }

  private isSignedOrRejected(result: any): boolean {
    return result === "Completed" || (result && result.status === "Rejected");
  }

  private showSigningDialogOpenError(message: string, error: any, options: UserSigningDialogOptions) {
    const dialog = (options && options.dialog) || this.dialog;
    if (error) {
      console.error("Unable to open signing dialog:", error);
    }
    dialog.open(AlertdialogComponent, {
      data: {
        actionname: "Sign Document",
        message: message,
        onlyclose: true,
      },
    });
  }
}
