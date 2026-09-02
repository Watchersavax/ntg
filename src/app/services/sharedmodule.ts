import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CourtAffidavitFilterPipe } from "../shared/filters/court-affidavit-search.pipe";
import { FilterPipe } from "../shared/filters/filter.pipe";
import { PaymentCheckComponent } from "../user/payment-check/payment-check.component";
import { AngularRaveModule } from "angular-rave";
import { CustomDatePipe } from "../shared/pipes/CustomDatePipe";
import { ContactUsComponent } from "../shared/contact-us/contact-us.component";
import { TicketGridComponent } from "../shared/ticket-grid/ticket-grid.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MaterialModule } from "./material-module";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { TicketActionDialogComponent } from "../shared/ticket-action-dialog/ticket-action-dialog.component";
import { environment } from "src/environments/environment";
import { RegistrationPaymnetComponent } from "../user/registration-payment/registration-payment.component";
import { CalendlyAppointmentDialogComponent } from "../user/calendly-appointment-dialog/calendly-appointment-dialog.component";
import { DocumensoSigningEmbedComponent } from "../shared/documenso-signing-embed/documenso-signing-embed.component";
import { DocumensoSigningDialogComponent } from "../shared/documenso-signing-dialog/documenso-signing-dialog.component";
import { PaginatorComponent } from "../shared/paginator/paginator.component";

@NgModule({
  imports: [
    CommonModule,
    AngularRaveModule.forRoot({
      key: environment.publicKey,
      isTest: environment.production,
    }),
    ReactiveFormsModule,
    MaterialModule,
    InfiniteScrollModule,
    FormsModule,
  ],
  declarations: [
    FilterPipe,
    CourtAffidavitFilterPipe,
    PaymentCheckComponent,
    CustomDatePipe,
    ContactUsComponent,
    TicketGridComponent,
    TicketActionDialogComponent,
    RegistrationPaymnetComponent,
    CalendlyAppointmentDialogComponent,
    DocumensoSigningEmbedComponent,
    DocumensoSigningDialogComponent,
    PaginatorComponent,
  ],
  exports: [
    FilterPipe,
    CourtAffidavitFilterPipe,
    PaymentCheckComponent,
    CustomDatePipe,
    ContactUsComponent,
    TicketGridComponent,
    TicketActionDialogComponent,
    RegistrationPaymnetComponent,
    CalendlyAppointmentDialogComponent,
    DocumensoSigningEmbedComponent,
    DocumensoSigningDialogComponent,
    PaginatorComponent,
  ],
  entryComponents: [
    TicketActionDialogComponent,
    CalendlyAppointmentDialogComponent,
    DocumensoSigningDialogComponent,
  ],
})
export class SharedModule {}