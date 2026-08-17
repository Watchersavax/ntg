import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AlertdialogComponent } from "../shared/alertdialog/alertdialog.component";
import * as moment from "moment";

/**
 * Opens the "Reject reason" popup for a rejected affidavit. Shared by the user and agent
 * document lists so the formatting (reason + "Rejected by" + "Rejected at") lives in one place.
 */
@Injectable({
  providedIn: "root",
})
export class RejectReasonDialogService {
  constructor(private dialog: MatDialog) {}

  open(registrarComments: string, signatureRejectedAt: string, rejectedBy?: string) {
    const details: string[] = [];
    if (rejectedBy) {
      details.push("Rejected by: " + rejectedBy);
    }
    const rejectedAt = this.formatRejectedAt(signatureRejectedAt);
    if (rejectedAt) {
      details.push("Rejected at: " + rejectedAt);
    }

    let message = registrarComments || "No reason provided";
    if (details.length) {
      message += "\n\n" + details.join("\n");
    }

    this.dialog.open(AlertdialogComponent, {
      data: {
        actionname: "Reject reason",
        message,
        onlyclose: true,
      },
    });
  }
  // Nigerian convention is day-first: DD/MM/YYYY HH:mm (e.g. 29/06/2026 08:24).
  // West Africa Time (+0100), matching how appointment times are displayed elsewhere.

  private formatRejectedAt(value: string): string {
    if (!value) {
      return "";
    }
    const parsed = moment(value).zone("+0100");
    return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : value;
  }
}
