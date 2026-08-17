import { NgModule } from "@angular/core";
import { Routes, RouterModule, Router } from "@angular/router";
import { UserdashboardComponent } from './userdashboard.component';
import { UserDocumentsListComponent } from './user-documents-list/user-documents-list.component';
import { UserPersonalComponent } from './user-personal/user-personal.component';
import { UserChangePasswordComponent } from './user-change-password/user-change-password.component';
import { UserAuthGuardService } from 'src/app/services/user-auth-guard.service';
import { UserTransactionsComponent } from './user-transactions/user-transactions.component';
import { AppointmentsComponent } from "./appointments/appointments.component";
import { AgentDocumentListComponent } from "./agent-document-list/agent-document-list.component";

export const userdashboardroutes: Routes = [{
  
        path: "",
        component: UserdashboardComponent,
        children: [
          {
            path: "documents",
            component: UserDocumentsListComponent,
            canActivate :[UserAuthGuardService]
          },
          {
            path: "documents/:status",
            component: UserDocumentsListComponent,
            canActivate :[UserAuthGuardService]
          },
          {
            path: "agent/documents",
            component: AgentDocumentListComponent,
            canActivate :[UserAuthGuardService]
          },
          {
            path: "agent/documents/:status",
            component: AgentDocumentListComponent,
            canActivate :[UserAuthGuardService]
          },
          {
            path: "personal",
            component: UserPersonalComponent,
            canActivate :[UserAuthGuardService]
          },
          {
            path: "password",
            component: UserChangePasswordComponent,
            canActivate :[UserAuthGuardService]
          },
          {
            path: "transaction",
            component: UserTransactionsComponent,
            canActivate :[UserAuthGuardService]
          },
          {
            path: "appointments",
            component: AppointmentsComponent,
            canActivate :[UserAuthGuardService]
          }
           
        ]
    }];

@NgModule({
  imports: [RouterModule.forChild(userdashboardroutes)],
  exports: [RouterModule]
})
export class UserDashboardRoutingModule {
  constructor(private route:Router){
  }
}