import { Component, OnInit } from '@angular/core';
import { AppointmentResponse } from 'src/app/shared/models/AppointmentResponse';
import { CourtDataService } from '../courtdataservices/court-data.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { VideocallComponent } from '../videocall/videocall.component';
import { ScheduleMeetingDialogComponent } from '../schedule-meeting-dialog/schedule-meeting-dialog.component';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { VideoCallUser } from '../models/VideoCallUser';
import * as moment from 'moment';
import { VIDEO_CALL_DIALOG_SIZE } from 'src/app/shared/constants/dialog-size.constants';
import { readUserData } from 'src/app/shared/utils/userdata-storage.util';
import { resolveAppointmentJoinStatus } from 'src/app/shared/utils/appointment-join-window.util';
import { formatAppointmentTimeWat } from 'src/app/shared/utils/appointment-time-format.util';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {

  appointmentsDetails: AppointmentResponse[];
  prevflag = true;
  nextflag = false;
  dataMessage = '';
  PAGE_SIZE = 15;
  page = 0;
  userid: number;
  ReschduleAppoinment: AppointmentResponse;
  constructor(public courtDataService : CourtDataService, public dialog: MatDialog) { 
    
  }

  ngOnInit() {
    this.userid = readUserData().userId;
    this.getAppointments();
  }

  getAppointments(){
    this.courtDataService.fetchAppointmentsForRegistrar(this.userid,this.page,this.PAGE_SIZE).subscribe(data => {
      if (data["success"] === true) {
        this.appointmentsDetails = this.formatAppointmentDates(data["data"]);
        this.setAppointmentsData();
      }
    }, () => {
      
    });
  }
  private formatAppointmentDates(appointments: AppointmentResponse[]): AppointmentResponse[] {
    return (appointments || []).map((appointment) => {
      appointment.formattedDate = formatAppointmentTimeWat(appointment.meetingTiming);
      return appointment;
    });
  }

  setAppointmentsData(){

    this.appointmentsDetails.forEach(appointment=>{
      appointment.affidavitCount=0;
      const joinStatus = resolveAppointmentJoinStatus({
        meetingTiming: appointment.meetingTiming,
        meetingEndTiming: appointment.meetingEndTiming,
        cancelled: appointment.cancelled,
        completed: appointment.completed,
        joinUrl: appointment.joinUrl,
        isAppointmentProduction: (environment as any).isAppointmentProduction !== false,
      });
      appointment.btnValue = joinStatus.btnValue;
      appointment.isBtnDisable = joinStatus.isBtnDisable;
      if(appointment.completed){
        appointment.affidavitCount = appointment.attendees.filter(obj => 
          obj.userAffidavit.registrarStatus === "Approved").length;
      }
  
    })
  
  }
  onJoinOrReschedule(appointment: AppointmentResponse){
    
    if(appointment.btnValue === 'Join'){
     this.joinMeeting(appointment);
    }

    if(appointment.btnValue == "Re-Schedule"){
      this.rescheduleAppoinment(appointment);
    }
  }

  joinMeeting(appointment:AppointmentResponse){

   let  videoCallUsers: VideoCallUser[] =[]; 
    appointment.attendees.forEach(attendee =>{
      let videoCallUser = new VideoCallUser();
      videoCallUser.userAffidavitId =attendee.userAffidavit.userAffidavitId;
      videoCallUser.currentStatus = attendee.userAffidavit.registrarStatus;
      videoCallUser.requesterName=attendee.user.displayName;
      videoCallUser.displayName = attendee.userAffidavit.isUploaded || attendee.userAffidavit.isCaseRelated ?attendee.userAffidavit.userAffidavitId + " - "+ attendee.user.displayName + " - "+attendee.userAffidavit.userAffidavitCustomName:attendee.userAffidavit.userAffidavitId + " - "+ attendee.user.displayName + " - "+attendee.userAffidavit.templateName;
      videoCallUser.templateName = attendee.userAffidavit.templateName;
      videoCallUser.price = attendee.userAffidavit.price;
      videoCallUser.affidavitUserEmail= attendee.user["email"]
      videoCallUser.isUploaded=attendee.userAffidavit.isUploaded;
      videoCallUser.isCaseRelated=attendee.userAffidavit.isCaseRelated;
      videoCallUser.signatureStatus = attendee.userAffidavit.signatureStatus;
      videoCallUser.signatureDocumentId = attendee.userAffidavit.signatureDocumentId;
      videoCallUser.userSigned = !!attendee.userAffidavit.signatureUserSignedAt;
      videoCallUser.userAffidavitCustomName=attendee.userAffidavit.userAffidavitCustomName!==null?attendee.userAffidavit.userAffidavitCustomName:attendee.userAffidavit.templateName;
      videoCallUser.deponentId=attendee.userAffidavit.deponentId;
      videoCallUsers.push(videoCallUser);
     
    });
   this.fetchDepoenentDetails(videoCallUsers,appointment);
   
  }
  
  fetchDepoenentDetails(videoCallUsers: VideoCallUser[],appointment:AppointmentResponse){
    videoCallUsers.forEach(element => {
      if(element.deponentId!=null){
        this.courtDataService.fetchDeponentByDeponentId(element.deponentId).subscribe(data => {
          if (data["success"] === true) {
            element.deponentName=data["data"]["firstName"]+" "+data["data"]["lastName"];
            element.deponentEmail=data["data"]["email"];
          }
        }, () => {
          
        });
      }
    });
    const dialogRef = this.dialog.open(VideocallComponent, {
      width: VIDEO_CALL_DIALOG_SIZE.wideWidth,
      maxWidth: VIDEO_CALL_DIALOG_SIZE.wideWidth,
      height: VIDEO_CALL_DIALOG_SIZE.wideHeight,
      data: {videoCallUsers: videoCallUsers, meetingtiming: appointment.meetingTiming,
      meetingUrl: appointment.joinUrl,meetingEndTiming:appointment.meetingEndTiming}});
      dialogRef.afterClosed().subscribe((data: string) => {
        if (data === 'Completed') {
          this.courtDataService.completeRegistrarAppoinment(appointment.appointmentId).subscribe(data=>{
            if(data["success"] === true){
              this.getAppointments();
            }
          })
        } 
      });
  }
  rescheduleAppoinment(appointment: AppointmentResponse){
    const dialogRef= this.dialog.open(
      ScheduleMeetingDialogComponent
     );
  
     dialogRef.afterClosed().subscribe((data: string) => {
      if (data === 'close') {
  
      } else  {
          let date =  moment(data);
          let appointmentTime = date.format('YYYY-MM-DDTHH:mm:ss');
          let  rescheduleAppoinment= new AppointmentResponse();
          rescheduleAppoinment = appointment; 
          rescheduleAppoinment.meetingTiming = appointmentTime;
      
          this.courtDataService.rescheduleAppoinment(appointment.appointmentId, rescheduleAppoinment).subscribe(data => {
            
            if (data["success"] === true ) {
              this.getAppointments();
              this.openAlertDialogBox('Appointment Scheduled', "This appointment has been Re-Scheduled successfully", true);
            }
          }, () => {
            
          });
        }
  
    });
  }

  deleteAppoinment(appointment: AppointmentResponse){
    this.dialog.open(AlertdialogComponent, 
      { data: { actionname: 'Delete Appoinment', message: "Do you want to delete this appoinment?", onlyclose: false }})
        .afterClosed()
        .subscribe(data => {
          if (data === 'Yes') {
    this.courtDataService.deleteAppoinment(appointment.appointmentId).subscribe(
      data =>{
        if (data["success"] === true ) {
              
          this.openAlertDialogBox('Appointment Deleted', "This appointment has been deleted successfully", true);
          this.getAppointments();
        }
        }, () => {
          
        }
    );
      }});
  }
  
  previousPage() {

    if(this.nextflag){
      this.nextflag = false  ;
    }

    if(this.page > 0){
      this.page--;
      this.dataMessage = "";
      this.courtDataService.fetchAppointmentsForRegistrar(this.userid,this.page,this.PAGE_SIZE)
        .subscribe((response: any) => {
          if (response.data.length === 0 ) {
            this.page++;
            this.dataMessage = '* no more data available ';
            this.prevflag = true;
            
          }
          else{
            this.appointmentsDetails = this.formatAppointmentDates(response.data);
            this.setAppointmentsData();
          }
          
        }, () => {
          this.page++;
          this.dataMessage = '* no more data available ';
          this.prevflag = true;
        });
    }else{
      this.prevflag = true;
      this.dataMessage = "";
    }
  }

  nextPage() {
    if(this.prevflag == true)
        this.prevflag = false;

    this.page++;
    this.courtDataService.fetchAppointmentsForRegistrar(this.userid,this.page,this.PAGE_SIZE)
        .subscribe((response: any) => {
          
        if (response.data.length === 0 ) {
          this.page--;
          this.dataMessage = '* no more data available ';
          this.nextflag = true;
          
        }
        else{
          this.appointmentsDetails = this.formatAppointmentDates(response.data);
          this.setAppointmentsData();
        }
        
      }, () => {
        this.page--;
        this.dataMessage = '* no more data available';
        this.nextflag = true;
      });
  }
  openAlertDialogBox(actionNameString: string, messageString: string, onlyCloseFlag): MatDialogRef<AlertdialogComponent> {
    const dialogRef = this.dialog.open(AlertdialogComponent, {
      data: {actionname: actionNameString, message: messageString, onlyclose: onlyCloseFlag}
    });
    return dialogRef;
  }
}
