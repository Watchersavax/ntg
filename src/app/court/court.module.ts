import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CourtComponent } from "./court.component";

import { MaterialModule } from "../services/material-module";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { CourtRoutingModule } from "./court-routing.module";
import { SharedModule } from "../services/sharedmodule";
import { CourtUserAffidavitGridComponent } from "./court-user-affidavit-grid/court-user-affidavit-grid.component";
import { BarcodeReaderComponent } from "./court-user-affidavit-grid/barcode-reader/barcode-reader.component";
import { ZXingScannerModule } from "@zxing/ngx-scanner";
import { AffidavtViewComponent } from "./court-user-affidavit-grid/affidavt-view/affidavt-view.component";
import { CourtResetPasswordComponent } from "./court-reset-password/court-reset-password.component";
import { CourtPersonalDetailsComponent } from "./court-personal-details/court-personal-details.component";
import { ScheduleMeetingDialogComponent } from "./schedule-meeting-dialog/schedule-meeting-dialog.component";
import { AppointmentsComponent } from "./appointments/appointments.component";
import { VideocallComponent } from "./videocall/videocall.component";
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { RegistrarDashboardComponent } from './registrar-dashboard/registrar-dashboard.component';
import { MatDatepickerModule } from "@angular/material";

@NgModule({
  declarations: [
    // CreateRegistrarUserComponent, EditRegistrarUserComponent,
    // RegistrarUserGridComponent,
    CourtComponent,
    CourtUserAffidavitGridComponent,
    BarcodeReaderComponent,
    AffidavtViewComponent,
    CourtResetPasswordComponent,
    CourtPersonalDetailsComponent,
    ScheduleMeetingDialogComponent,
    AppointmentsComponent,
    VideocallComponent,
    RegistrarDashboardComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    InfiniteScrollModule,
    CourtRoutingModule,
    ZXingScannerModule,
    PdfViewerModule,
    MatDatepickerModule
  ],
    //CreateRegistrarUserComponent,EditRegistrarUserComponent,
  entryComponents: [
    BarcodeReaderComponent,
    AffidavtViewComponent,
    ScheduleMeetingDialogComponent,
    VideocallComponent,
  ],
})
export class CourtModule {}
