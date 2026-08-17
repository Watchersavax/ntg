import { Component, OnInit } from "@angular/core";
import { AttendeeResponse } from "src/app/shared/models/AttendeeResponse";
import { CourtDataService } from "src/app/court/courtdataservices/court-data.service";
import { UserdataService } from "../../userservices/userdata.service";
import { UserAppointmentJoinService } from "../user-appointment-join.service";
import { hasUserSigned, requiresUserSignature } from "src/app/shared/utils/signing-status.util";

@Component({
  selector: "app-appointments",
  templateUrl: "./appointments.component.html",
  styleUrls: ["./appointments.component.css"],
})
export class AppointmentsComponent implements OnInit {
  appointmentsDetails: AttendeeResponse[];
  prevflag = true;
  nextflag = false;
  dataMessage = "";
  PAGE_SIZE = 15;
  page = 0;
  userid: number;
  constructor(
    public courtDataService: CourtDataService,
    private userDataService: UserdataService,
    private userAppointmentJoinService: UserAppointmentJoinService
  ) {}

  ngOnInit() {
    this.userid = JSON.parse(localStorage.getItem("userdata"))["userId"];
    this.getAppointments();
  }

  getAppointments() {
    this.courtDataService
      .fetchAppointmentsForUser(this.userid, this.page, this.PAGE_SIZE)
      .subscribe(
        (data) => {
          if (data["success"] === true) {
            this.appointmentsDetails = data["data"];
            this.appointmentsDetails = this.appointmentsDetails.map(
              (appointment) => {
                appointment.appointmentDto.formattedDate = this.userAppointmentJoinService.formatMeetingTiming(
                  appointment.appointmentDto.meetingTiming
                );
                return appointment;
              }
            );
            
            this.setAppointmentsData();
          }
        },
        () => {
          
        }
      );
  }

  setAppointmentsData() {
    this.appointmentsDetails.forEach((appointment) => {
      const joinStatus = this.userAppointmentJoinService.resolveJoinStatus(
        appointment.appointmentDto.meetingTiming,
        appointment.appointmentDto.meetingEndTiming,
        appointment.appointmentDto.cancelled,
        appointment.completed,
        appointment.appointmentDto.joinUrl
      );
      appointment.btnValue = joinStatus.btnValue;
      appointment.isBtnDisable = joinStatus.isBtnDisable || this.isJoinWaitingForUserSignature(appointment);
    });
  }

  openVideoDialog(appointment: AttendeeResponse) {
    if (appointment.isBtnDisable) {
      return;
    }

    this.userAppointmentJoinService.openVideoDialog({
      userAffidavitObj: appointment.userAffidavit,
      meetingId: appointment.appointmentDto.appointmentId,
      meetingTiming: appointment.appointmentDto.formattedDate,
      meetingEndTiming: appointment.appointmentDto.meetingEndTiming,
      meetingUrl: appointment.appointmentDto.joinUrl,
      attendeeId: appointment.attendeeId,
      afterCompleted: () => this.getAppointments(),
    });
  }

  private isJoinWaitingForUserSignature(appointment: AttendeeResponse): boolean {
    return !!appointment
      && appointment.btnValue === "Join"
      && requiresUserSignature(appointment.userAffidavit)
      && !hasUserSigned(appointment.userAffidavit);
  }

  previousPage() {
    if (this.nextflag) {
      this.nextflag = false;
    }

    if (this.page > 0) {
      this.page--;
      this.dataMessage = "";
      this.courtDataService
        .fetchAppointmentsForUser(this.userid, this.page, this.PAGE_SIZE)
        .subscribe(
          (response: any) => {
            if (response.data.length === 0) {
              this.page++;
              this.dataMessage = "* no more data available ";
              this.prevflag = true;
            } else {
              this.appointmentsDetails = response.data;
              this.setAppointmentsData();
            }
          },
          () => {
            this.page++;
            this.dataMessage = "* no more data available ";
            this.prevflag = true;
          }
        );
    } else {
      this.prevflag = true;
      this.dataMessage = "";
    }
  }

  nextPage() {
    if (this.prevflag == true) this.prevflag = false;

    this.page++;
    this.courtDataService
      .fetchAppointmentsForUser(this.userid, this.page, this.PAGE_SIZE)
      .subscribe(
        (response: any) => {
          if (response.data.length === 0) {
            this.page--;
            this.dataMessage = "* no more data available ";
            this.nextflag = true;
          } else {
            this.appointmentsDetails = response.data;
            this.setAppointmentsData();
          }
        },
        () => {
          this.page--;
          this.dataMessage = "* no more data available";
          this.nextflag = true;
        }
      );
  }
}
