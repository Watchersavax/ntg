import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserdashboardComponent } from './userdashboard.component';
import { UserDashboardRoutingModule } from './user-dashboard-routing-module';
import { UserDocumentsListComponent } from './user-documents-list/user-documents-list.component';
import { UserPersonalComponent } from './user-personal/user-personal.component';
import { UserChangePasswordComponent } from './user-change-password/user-change-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/services/material-module';
import { ContactNumberValidator } from '../directives/contact-number.directive';
import { UserTransactionsComponent } from './user-transactions/user-transactions.component';
import { SafePipe } from 'src/app/shared/pipes/safe.pipe';
import { SharedModule } from 'src/app/services/sharedmodule';
import { ClickElsewhereDirective } from 'src/app/shared/directives/clickElseWhereDirective';
import { AppointmentsComponent } from './appointments/appointments.component';
import { VideocallDialogComponent } from './videocall-dialog/videocall-dialog.component';
import { AgentDocumentListComponent } from './agent-document-list/agent-document-list.component';
import { SafeHtmlPipe, UserUploadAffidavitComponent } from './user-upload-affidavit/user-upload-affidavit.component';
import { MatSelectModule } from '@angular/material';
import { UploadAffidavitAgentComponent } from './upload-affidavit-agent/upload-affidavit-agent.component';
import { PriceInformationDialogComponent } from './price-information-dialog/price-information-dialog.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PhoneVerificationDialogComponent } from './phone-verification-dialog/phone-verification-dialog.component';
import { PhoneVerificationComponent } from './phone-verification/phone-verification.component';
import { UserAppointmentJoinService } from './user-appointment-join.service';
import { UserDocumentActionsService } from './user-document-actions.service';

@NgModule({
  declarations: [
    UserdashboardComponent,
    UserDocumentsListComponent,
    UserPersonalComponent,
    UserChangePasswordComponent,
    ContactNumberValidator,
    UserTransactionsComponent,
    SafePipe,
    SafeHtmlPipe,
    ClickElsewhereDirective,
    AppointmentsComponent,
    VideocallDialogComponent,
    AgentDocumentListComponent,
    UserUploadAffidavitComponent,
    UploadAffidavitAgentComponent,
    PriceInformationDialogComponent,
    PhoneVerificationComponent,
    PhoneVerificationDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    MaterialModule,
    UserDashboardRoutingModule,
    ReactiveFormsModule,
    MatSelectModule,
    PdfViewerModule
  ],
   entryComponents:[VideocallDialogComponent,
    UserUploadAffidavitComponent,UploadAffidavitAgentComponent,
    PriceInformationDialogComponent,
    PhoneVerificationDialogComponent],
  providers: [UserAppointmentJoinService, UserDocumentActionsService]
})
export class UserDashboardModule {
  constructor() { }
}
