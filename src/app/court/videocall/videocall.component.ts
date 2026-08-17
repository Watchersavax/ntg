import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material";
import { AlertdialogComponent } from "src/app/shared/alertdialog/alertdialog.component";
import { VideoCallUser } from "../models/VideoCallUser";
import { SigningDocumentService } from "src/app/services/signing-document.service";
import { VIDEO_CALL_DIALOG_SIZE } from "src/app/shared/constants/dialog-size.constants";
import {
  hasUserSigned,
  isFailedSigningStatus,
  isFinishedSigningStatus,
  isTerminalSigningStatus,
  requiresUserSignature,
  resolveSigningStatus,
  SigningStatus,
} from "src/app/shared/utils/signing-status.util";
import { formatAppointmentTimeWat } from "src/app/shared/utils/appointment-time-format.util";

interface VideoCallSigningViewState {
  mode: "waiting-user" | "loading" | "embed" | "finished" | "failed";
  compact: boolean;
  canLoadRegistrarUrl: boolean;
  message?: string;
  icon?: string;
  status?: string;
}

@Component({
  selector: "app-videocall",
  templateUrl: "./videocall.component.html",
  styleUrls: ["./videocall.component.css"],
})
export class VideocallComponent implements OnInit {
  SigningStatus = SigningStatus;

  videoCallUsers: VideoCallUser[] = [];
  meetingTiming;
  templateName;
  userAffidavitName;
  user: VideoCallUser = new VideoCallUser();

  isUploaded: Boolean;
  isCaseRelated: Boolean;
  meetingUrl: string;
  refreshing: boolean = false;
  registrarSigningUrl: string;
  loadingRegistrarSigningUrl: boolean = false;
  private registrarSigningFinishedStatus: string;
  private registrarSigningRequestId = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<VideocallComponent>,
    public dialog: MatDialog,
    private signingDocumentService: SigningDocumentService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.videoCallUsers = this.data["videoCallUsers"];
    this.videoCallUsers = this.videoCallUsers.map(ele => {
      ele.selected = false;
      return ele;
    })

    this.videoCallUsers[0].selected = true;
    this.meetingTiming = this.extractTimeRangeAmPm(this.data["meetingtiming"], this.data["meetingEndTiming"]);
    this.meetingUrl = this.data["meetingUrl"];
    this.setSelectedUser(this.videoCallUsers[0]);
  }

  selectMeeting(user) {
    if (user && user.selected) {
      return;
    }
    this.videoCallUsers = this.videoCallUsers.map(ele => {
      ele.selected = ele.userAffidavitId === user.userAffidavitId;
      return ele;
    })
    this.setSelectedUser(user);
  }

  setSelectedUser(user: VideoCallUser) {
    this.user = user;
    this.templateName = user.templateName;
    this.userAffidavitName = user.userAffidavitCustomName;
    this.isUploaded = user.isUploaded;
    this.isCaseRelated = user.isCaseRelated;
    this.registrarSigningUrl = null;
    this.registrarSigningFinishedStatus = null;
    this.loadingRegistrarSigningUrl = false;
    this.registrarSigningRequestId++;
    this.updateDialogSize();
    this.loadRegistrarSigningUrlIfReady();
  }

  onClosePopup() {
    this.dialogRef.close();
  }

  completeMeeting() {
    if (!this.canCompleteMeeting()) {
      return;
    }
    const confirmationMessage =
      "Are you sure to complete this meeting? Once completed, this meeting cannot be joined again.";
    this.dialog
      .open(AlertdialogComponent, {
        data: {
          actionname: "Complete Meeting",
          message: confirmationMessage,
          onlyclose: false,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === "Yes") {
          this.dialogRef.close("Completed");
        }
      });
  }

  joinMeeting() {
    window.open(this.meetingUrl, '_blank');
  }

  canCompleteMeeting(): boolean {
    return this.videoCallUsers && this.videoCallUsers.length > 0
      && this.videoCallUsers.every((user) => this.isCompleteEligibleStatus(this.signingStatusForUser(user)));
  }

  extractTimeRangeAmPm(isoString,meetingEndTiming) {

    const startTime = formatAppointmentTimeWat(isoString, "h:mm");

    if (!meetingEndTiming) {
      return startTime;
  }
    const endTime = formatAppointmentTimeWat(meetingEndTiming, "h:mm A");
    const timeString = `${startTime} - ${endTime}`;
    return timeString;
  }

  signingViewState(): VideoCallSigningViewState {
    const status = this.signingViewStatus();
    if (isFailedSigningStatus(status)) {
      return {
        mode: "failed",
        compact: true,
        canLoadRegistrarUrl: false,
        icon: "error_outline",
        message: "There was a problem sending the document for signing. Please contact support.",
        status: status,
      };
    }
    if (isFinishedSigningStatus(status)) {
      return {
        mode: "finished",
        compact: true,
        canLoadRegistrarUrl: false,
        icon: status === SigningStatus.COMPLETED ? "check_circle" : "info_outline",
        message: this.signingFinishedMessage(status),
        status: status,
      };
    }
    if (requiresUserSignature(this.user) && !hasUserSigned(this.user)) {
      return {
        mode: "waiting-user",
        compact: true,
        canLoadRegistrarUrl: false,
        icon: "hourglass_empty",
        message: "Waiting for the user to sign the document.",
        status: status,
      };
    }
    const canLoadRegistrarUrl = !!this.user && !isTerminalSigningStatus(status);
    return {
      mode: this.registrarSigningUrl ? "embed" : "loading",
      compact: false,
      canLoadRegistrarUrl: canLoadRegistrarUrl,
      status: status,
    };
  }

  private signingViewStatus(): string {
    if (this.registrarSigningFinishedStatus) {
      return this.registrarSigningFinishedStatus;
    }
    return this.signingStatusForUser(this.user);
  }

  refreshUserSigned() {
    if (!this.user || !this.user.userAffidavitId || this.refreshing) {
      return;
    }
    this.refreshing = true;
    this.signingDocumentService
      .getSigningStatus(this.user.userAffidavitId)
      .then((data) => {
        this.user.userSigned = !!(data && data.userSigned);
        this.user.signatureStatus = resolveSigningStatus(data, this.user.signatureStatus);
        this.loadRegistrarSigningUrlIfReady();
      })
      .catch((error) => {
        console.error("Unable to refresh signing status:", error);
      })
      .finally(() => {
        this.refreshing = false;
      });
  }

  onRegistrarDocumentFinished(status: string) {
    if (!this.user || !this.user.userAffidavitId) {
      return;
    }
    this.registrarSigningFinishedStatus = status;
    this.registrarSigningUrl = null;
    this.updateDialogSize();
    this.refreshing = true;
    this.signingDocumentService
      .getSigningStatus(this.user.userAffidavitId)
      .then((data) => {
        if (data) {
          this.user.signatureStatus = resolveSigningStatus(data, this.user.signatureStatus);
          if (isTerminalSigningStatus(this.user.signatureStatus)) {
            this.registrarSigningFinishedStatus = null;
          }
          if (data.registrarSigned || data.completed || data.rejected || data.cancelled) {
            this.registrarSigningUrl = null;
          }
          this.updateDialogSize();
        }
      })
      .catch((error) => {
        console.error("Unable to refresh signing status:", error);
      })
      .finally(() => {
        this.refreshing = false;
      });
  }

  private loadRegistrarSigningUrlIfReady() {
    if (!this.signingViewState().canLoadRegistrarUrl || !this.user.userAffidavitId) {
      this.updateDialogSize();
      return;
    }
    this.updateDialogSize();
    const affidavitId = this.user.userAffidavitId;
    const requestId = ++this.registrarSigningRequestId;
    this.loadingRegistrarSigningUrl = true;
    this.signingDocumentService
      .getRegistrarSigningEmbed(affidavitId)
      .then((data) => {
        if (requestId !== this.registrarSigningRequestId) {
          return;
        }
        this.registrarSigningUrl = data && data.signingUrl;
        this.updateDialogSize();
      })
      .catch((error) => {
        if (requestId !== this.registrarSigningRequestId) {
          return;
        }
        console.error("Unable to load registrar signing link:", error);
        this.updateDialogSize();
      })
      .finally(() => {
        if (requestId !== this.registrarSigningRequestId) {
          return;
        }
        this.loadingRegistrarSigningUrl = false;
      });
  }

  private updateDialogSize() {
    if (this.signingViewState().compact) {
      this.dialogRef.updateSize(VIDEO_CALL_DIALOG_SIZE.compactWidth, "auto");
      return;
    }
    this.dialogRef.updateSize(VIDEO_CALL_DIALOG_SIZE.wideWidth, VIDEO_CALL_DIALOG_SIZE.wideHeight);
  }

  private signingFinishedMessage(status: string): string {
    if (status === SigningStatus.COMPLETED) {
      return "Document successfully signed.";
    }
    if (status === SigningStatus.REJECTED) {
      return "Document signing was rejected.";
    }
    return "Document signing was cancelled.";
  }

  private signingStatusForUser(user: VideoCallUser): string {
    if (user && this.user && user.userAffidavitId === this.user.userAffidavitId && this.registrarSigningFinishedStatus) {
      return this.registrarSigningFinishedStatus;
    }
    return user && user.signatureStatus;
  }

  private isCompleteEligibleStatus(status: string): boolean {
    return status === SigningStatus.COMPLETED || status === SigningStatus.REJECTED;
  }

}
