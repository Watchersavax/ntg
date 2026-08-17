import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { TemplatesComponent } from './manageTemplates/templates.component';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { InnerUserComponent } from './manageUsers/inner-user/inner-user.component';
import { UserAffidavitComponent } from './manageUsers/user-affidavit/user-affidavit.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { AdminPersonalComponent } from './admin-personal/admin-personal.component';

import { TicketGridComponent } from 'src/app/shared/ticket-grid/ticket-grid.component';
import { FaqComponent } from './manageApplication/faq/faq.component';
import { ContactUsComponent } from 'src/app/shared/contact-us/contact-us.component';
import { RegistrarUserGridComponent } from 'src/app/court/registrar-user-grid/registrar-user-grid.component';
import { ManageadminsComponent } from './manageadmins/manageadmins.component';
import { RegistarAffidavitComponent } from './manageUsers/registar-affidavit/registar-affidavit.component';
import { AdminTemplateComponent } from './manageadmins/admin-template/admin-template.component';
import { ManagecategoriesComponent } from './managecategories/managecategories.component';
import { ManagesubcategoriesComponent } from './managecategories/managesubcategories/managesubcategories.component';

// Routing Configuration
export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      
      {
        path: 'templates',
        component: TemplatesComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'tickets',
        component: TicketGridComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'contactus',
        component: ContactUsComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'users',
        component: InnerUserComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'admins',
        component: ManageadminsComponent,
        canActivate: [AuthGuardService]
      },
      {
        path:'admins/template',
        component:AdminTemplateComponent,
        canActivate :[AuthGuardService]
       },
      {
        path: 'users/affidavit',
        component: UserAffidavitComponent,
        canActivate: [AuthGuardService]
      },
      {
            path:'registrars',
            component:RegistrarUserGridComponent,
            canActivate :[AuthGuardService]
      },
      {
        path:'registrars/affidavit',
        component:RegistarAffidavitComponent,
        canActivate :[AuthGuardService]
       },
      {
        path: 'manageapp',
        component: FaqComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'passreset',
        component: PasswordResetComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'personal',
        component: AdminPersonalComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'categories',
        component: ManagecategoriesComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'subcategories',
        component: ManagesubcategoriesComponent,
        canActivate: [AuthGuardService]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
