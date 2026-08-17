import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import * as moment from "moment";
import { AffidavitRecreationService } from "src/app/services/affidavit-recreation.service";
import { AlertdialogComponent } from "src/app/shared/alertdialog/alertdialog.component";
import {
  canSendToSign,
  canUserSignDocument,
  hasUserSigned,
  requiresUserSignature
} from "src/app/shared/utils/signing-status.util";
import { UploadAffidavitAgentComponent } from "./upload-affidavit-agent/upload-affidavit-agent.component";
import { UserAppointmentJoinService } from "./user-appointment-join.service";
import { UserUploadAffidavitComponent } from "./user-upload-affidavit/user-upload-affidavit.component";

@Injectable()
export class UserDocumentActionsService {
  constructor(
    private userAppointmentJoinService: UserAppointmentJoinService,
    private router: Router,
    private dialog: MatDialog,
    private recreationService: AffidavitRecreationService
  ) {}

  canCancelScheduledAppointment(meetingTiming: any): boolean {
    if (!meetingTiming) {
      return false;
    }
    const date = moment(meetingTiming);
    if (!date.isValid()) {
      return false;
    }
    const minutesUntilMeeting = (date.toDate().getTime() - new Date().getTime()) / 60000;
    return minutesUntilMeeting > 10;
  }

  isMissedAppointment(documentObj: any): boolean {
    if (!documentObj) {
      return false;
    }
    return documentObj.missedAppointment === true;
  }

  canJoinMeeting(documentObj: any): boolean {
    return (!requiresUserSignature(documentObj) || hasUserSigned(documentObj))
      && this.userAppointmentJoinService.canJoin(
      documentObj.meetingTiming,
      documentObj.meetingEndTiming,
      documentObj.appointmentCancelled,
      documentObj.appointmentCompleted,
      documentObj.appointmentJoinUrl
    );
  }

  canSignDocument(documentObj: any): boolean {
    return canUserSignDocument(documentObj);
  }

  canSendToSignDocument(documentObj: any): boolean {
    return canSendToSign(documentObj);
  }

  canRecreateDocument(documentObj: any): boolean {
    return documentObj && documentObj.canRecreate === true;
  }

  recreateDocument(documentObj: any, isAgent: boolean): void {
    if (!this.canRecreateDocument(documentObj)) {
      return;
    }
    this.recreationService.getContext(documentObj.userAffidavitId).subscribe((response: any) => {
      if (!response || response.success !== true || !response.data || response.data.canRecreate !== true) {
        // The row may have been listed before the 48h window closed or the document was
        // recreated elsewhere; say so instead of leaving the button silently dead.
        documentObj.canRecreate = false;
        this.showRecreationUnavailable();
        return;
      }
      const context = response.data;
      if (context.creationMethod === "TEMPLATE") {
        const commands = context.deponentId
          ? ["/user", "filltemplate", context.templateId, context.deponentId]
          : ["/user", "filltemplate", context.templateId];
        this.router.navigate(commands, {
          queryParams: { recreateSourceAffidavitId: context.sourceAffidavitId }
        });
        return;
      }
      const dialogData = {
        recreationContext: context,
        templatePrice: documentObj.templatePrice,
        templateFastTrackPrice: documentObj.templateFastTrackPrice
      };
      if (isAgent) {
        this.dialog.open(UploadAffidavitAgentComponent, { data: dialogData });
      } else {
        this.dialog.open(UserUploadAffidavitComponent, { data: dialogData });
      }
    }, () => {
      this.showRecreationUnavailable();
    });
  }

  private showRecreationUnavailable(): void {
    this.dialog.open(AlertdialogComponent, {
      data: {
        actionname: "Recreate Affidavit",
        message: "This affidavit can no longer be recreated.",
        onlyclose: true
      }
    });
  }
}
