import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { CalendlyAppointmentDialogService } from "./calendly-appointment-dialog.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { HttpClient } from "@angular/common/http";
import { LoadingscreenService } from "src/app/services/loadingscreen.service";
import { UserDataService } from "src/app/admin/dashboard/manageUsers/UserServices/user-data.service";

declare global {
  interface Window {
    affidavitId: any;
    showCalendly: boolean;
    scheduleTime: string;
    sessionId: any;
  }
}
declare var Calendly: any;
@Component({
  selector: "app-calendly-appointment-dialog",
  templateUrl: "./calendly-appointment-dialog.component.html",
  styleUrls: ["./calendly-appointment-dialog.component.css"],
})
export class CalendlyAppointmentDialogComponent implements OnInit,OnDestroy {
  @Input() affidavitId: number;
  @Input() name!: string;
  @Input() email!: string;
  @Input() isExpress: Boolean;
  @Input() embedded = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  message: string;
  isEventScheduled: boolean ; 
  sessions:any = []
  private isDestroyed = false;
  private messageEventListener: (event: MessageEvent) => void;

  constructor(
    private dialogRef: MatDialogRef<CalendlyAppointmentDialogComponent>,private cdr: ChangeDetectorRef,
    private userDataService: UserDataService,
    private calendlyAppointmentDialogService: CalendlyAppointmentDialogService,private loadingscreenservice: LoadingscreenService,
    private http: HttpClient, @Inject(MAT_DIALOG_DATA) public data: any
  //             // handle error
  //             
  //             // handle success
  //   //         sessionId: window.sessionId
  //   //         userAffidavitId: this.window.affidavitId,
  //   //         inviteeUri: event.data.payload.invitee.uri,
  //   //         eventUri: event.data.payload.event.uri,
  //   //       let calendlyAppointmentDialogService: CalendlyAppointmentDialogService =
  //   //       this.window.showCalendly
  //   //       event.data.event == "calendly.event_scheduled" &&
  //   //     if (
  ) {}

  ngOnInit() {
    this.message = this.data.activeTab;

    this.loadSession(this.isExpress);

    this.messageEventListener = (event: MessageEvent) => {
      if (this.isCalendlyEvent(event)) {
        if (event.data.event === "calendly.event_scheduled" && (window as any).showCalendly) {
          (window as any).showCalendly = false;
          this.loadingscreenservice.startLoading();
          this.calendlyAppointmentDialogService.saveScheduledEvents({  
            eventUri: event.data.payload.event.uri,
            inviteeUri: event.data.payload.invitee.uri,
            userAffidavitId: (window as any).affidavitId,
            sessionId: (window as any).sessionId
          }).then(response => {
              this.handleSaveResponse(response);
          }).catch(error => {
              this.handleSaveFailure(error);
          }).finally(() => {
            this.loadingscreenservice.stopLoading();
          });
        }
      }
    };
  
    window.addEventListener("message", this.messageEventListener);
  }

  isCalendlyEvent(event: any): boolean {
    return event.origin === 'https://calendly.com';
  }

  ngOnDestroy() {
    this.isDestroyed = true; 
    window.removeEventListener("message", this.messageEventListener);
  }

  private handleSaveResponse(response: any) {
    if (this.isDestroyed) {
      return; 
    }
    if (!response || response.schedulingStatus === "Problem" || !response.affidavitId) {
      this.handleSaveFailure({ error: response });
      return;
    }
    this.isEventScheduled = true;
    this.cdr.detectChanges();
    this.close(response);
  }

  private handleSaveFailure(error: any) {
    if (this.isDestroyed) {
      return;
    }
    const response = error && error.error ? error.error : error;
    this.isEventScheduled = false;
    this.message = "SchedulingFailed";
    this.cdr.detectChanges();
    this.close(response);
  }

  private calendly(session) {
    let url = session.sessionUrl;
    window.affidavitId = this.affidavitId;
    window.sessionId = session.sessionId;
    window.showCalendly = true;
    const month = new Date();
    url = url + `?month=${month.getUTCFullYear()+"-"+(month.getUTCMonth()+1)}&hide_event_type_details=1&hide_gdpr_banner=1&primary_color=006d3e`
    if (this.name) {
      this.name = this.name.replace(" ", "%20");
      url = url + `&name=${this.name}`;
    }

    if (this.email) {
      url = url + `&email=${this.email}`;
    }

    document.getElementById("container").innerHTML = "";
    Calendly.initInlineWidget({
      url: url,
      parentElement: document.getElementById("container"),
    });
  }

  loadSession(isExpress) {
    this.userDataService.getSessionByType(isExpress).subscribe((response) => {
      this.sessions = response;
      this.sessions = this.sessions.filter(session => session.isActive && session.isRegistrarAvailable)
      this.sessions = this.sessions.map(session => {
        session.select = false
        return session
      });
      if (!this.sessions.length) {
        return;
      }
      this.sessions[0].select = true;
      this.calendly(this.sessions[0]);
    });
  }

   close(response?: any) {
    if (this.message === undefined) {
      this.message = "Verified";
    }
    if (this.isEventScheduled) {
      this.message = "Scheduled";
    }
    localStorage.setItem("message", this.message);
    const eventStatus = response && response.schedulingStatus === "Problem"
      ? "SchedulingFailed"
      : response && response.signingCreated === false ? "SigningFailed" : this.message;
    const closeResult = response ? Object.assign({ status: eventStatus }, response) : this.message;
    this.onClose.emit(closeResult);
    if (!this.embedded) {
      this.dialogRef.close(closeResult);
    }
  }

  changeCalendly(session) {
    this.sessions = this.sessions.map(ele => {
      ele.select = session.sessionId == ele.sessionId
      return ele
    });
    this.calendly(session);
  }
}

function isCalendlyEvent(e) {
  return e.data.event && e.data.event.indexOf("calendly") === 0;
}