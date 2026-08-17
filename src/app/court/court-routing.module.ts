import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CourtComponent } from './court.component';
import { CourtUserAffidavitGridComponent } from './court-user-affidavit-grid/court-user-affidavit-grid.component';
import { CourtAuthGuardService } from '../services/court-auth-guard.service';
import { StateAuthGuardService } from '../services/state-auth-guard.service';
import { CourtResetPasswordComponent } from './court-reset-password/court-reset-password.component';
import { CourtPersonalDetailsComponent } from './court-personal-details/court-personal-details.component';
import { TicketGridComponent } from '../shared/ticket-grid/ticket-grid.component';
import { ContactUsComponent } from '../shared/contact-us/contact-us.component';
import { AppointmentsComponent } from "./appointments/appointments.component";
import { RegistrarDashboardComponent } from "./registrar-dashboard/registrar-dashboard.component";

export const routes: Routes = [
    {
        path: '',
        component: CourtComponent,
        children: [
          {
            path: '',
            redirectTo: 'registrars',
            pathMatch: 'full'
          },
          {
            path:'registrartickets',
            component:TicketGridComponent,
            canActivate :[StateAuthGuardService]
          },
          {
            path:'statecontactus',
            component:ContactUsComponent,
            canActivate :[StateAuthGuardService]
          },
          {
            path:'courtcontactus',
            component:ContactUsComponent,
            canActivate :[CourtAuthGuardService]
          },
          {
            path:'courtaffidavit',
            component:CourtUserAffidavitGridComponent,
            canActivate :[CourtAuthGuardService]
          },
          {
            path:'courtaffidavittickets',
            component:TicketGridComponent,
            canActivate :[CourtAuthGuardService]
          },
          {
            path:'resetpass',
            component:CourtResetPasswordComponent
          },
          {
            path:'personal',
            component:CourtPersonalDetailsComponent
          },
          {
            path:'appointments',
            component:AppointmentsComponent,
            canActivate :[CourtAuthGuardService]
          },
          {
            path:'dashboard',
            component:RegistrarDashboardComponent,
            canActivate :[CourtAuthGuardService]
          },

        ]
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CourtRoutingModule {}
