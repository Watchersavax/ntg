import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CourtDataService } from "src/app/court/courtdataservices/court-data.service";
import { VideocallDialogComponent } from "./videocall-dialog/videocall-dialog.component";
import { resolveAppointmentJoinStatus } from "src/app/shared/utils/appointment-join-window.util";
import { formatAppointmentTimeWat } from "src/app/shared/utils/appointment-time-format.util";
import { environment } from "src/environments/environment";

export interface UserAppointmentJoinStatus {
  btnValue: string;
  isBtnDisable: boolean;
}

export interface UserVideoDialogOptions {
  userAffidavitObj: any;
  meetingId: number;
  meetingTiming: any;
  meetingEndTiming?: any;
  meetingUrl: string;
  attendeeId: number;
  afterCompleted?: () => void;
}

@Injectable()
export class UserAppointmentJoinService {
  constructor(
    private dialog: MatDialog,
    private courtDataService: CourtDataService
  ) {}

  formatMeetingTiming(meetingTiming: any): string {
    return formatAppointmentTimeWat(meetingTiming);
  }

  resolveJoinStatus(
    meetingTiming: any,
    meetingEndTiming: any,
    cancelled: boolean,
    completed: boolean,
    joinUrl?: string
  ): UserAppointmentJoinStatus {
    return resolveAppointmentJoinStatus({
      meetingTiming: meetingTiming,
      meetingEndTiming: meetingEndTiming,
      cancelled: cancelled,
      completed: completed,
      joinUrl: joinUrl,
      isAppointmentProduction: (environment as any).isAppointmentProduction !== false,
    });
  }

  canJoin(meetingTiming: any, meetingEndTiming: any, cancelled: boolean, completed: boolean, joinUrl?: string): boolean {
    const status = this.resolveJoinStatus(meetingTiming, meetingEndTiming, cancelled, completed, joinUrl);
    return status.btnValue === "Join" && !status.isBtnDisable;
  }

  openVideoDialog(options: UserVideoDialogOptions) {
    if (!options || !options.meetingUrl || !options.attendeeId) {
      return;
    }

    this.dialog
      .open(VideocallDialogComponent, {
        data: {
          userAffidavitObj: options.userAffidavitObj,
          meetingId: options.meetingId,
          meetingTiming: options.meetingTiming,
          meetingEndTiming: options.meetingEndTiming,
          meetingUrl: options.meetingUrl,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === "Completed") {
          this.courtDataService.completeUserAppoinment(options.attendeeId).subscribe((response) => {
            if (response["success"] === true && options.afterCompleted) {
              options.afterCompleted();
            }
          });
        }
      });
  }
}
