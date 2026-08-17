import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { UserComponent } from "./user.component";
import { FillTemplateComponent } from "./fill-template/fill-template.component";
import { TemplateListingComponent } from "./template-listing/template-listing.component";
import { UserForgotComponent } from "./user-auth/user-forgot/user-forgot.component";
import { UserSignupComponent } from "./user-auth/user-signup/user-signup.component";
import { PaymentCheckComponent } from "./payment-check/payment-check.component";
import { EditAffidavitComponent } from "./edit-affidavit/edit-affidavit.component";
import { UserAuthGuardService } from "../services/user-auth-guard.service";
import { TemplateDescriptionPageComponent } from "./template-description-page/template-description-page.component";
import { ContactUsComponent } from "../shared/contact-us/contact-us.component";
import { HelpComponent } from "./help-centre/help/help.component";
import { RegistrationPaymnetComponent } from "./registration-payment/registration-payment.component";
import { TemplateCardListingComponent } from "./template-card-listing/template-card-listing.component";
import { HowItWorksComponent } from "./how-it-works/how-it-works.component";
import { UserProfilesComponent } from "./user-profiles/user-profiles.component";
import { HelpCentreComponent } from "./help-centre/help-centre.component";
import { AgentsComponent } from "./user-profiles/agents/agents.component";
import { CorporateComponent } from "./user-profiles/corporate/corporate.component";
import { IndividualComponent } from "./user-profiles/individual/individual.component";
import { ContactComponent } from "./help-centre/contact/contact.component";

export const userroutes: Routes = [
  {
    path: "signup",
    component: UserSignupComponent,
  },
  {
    path: "home",
    component: UserSignupComponent,
    pathMatch: "full",
  },
  {
    path: "",
    component: UserComponent,
    children: [
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full",
      },
      {
        path: "contactus",
        component: ContactUsComponent,
        canActivate: [UserAuthGuardService],
      },
      {
        path: "help",
        component: HelpComponent,
      },
      {
        path: "how-it-work",
        component: HowItWorksComponent,
      },
      {
        path: "user-profiles",
        component: UserProfilesComponent,
            children: [
              {
                path: "individual",
                component: IndividualComponent,
              },
              {
                path: "corporate",
                component: CorporateComponent,
              },
              {
                path: "agents",
                component: AgentsComponent,
              },
          ]
      },
      {
        path: "help-centre",
        component: HelpCentreComponent,
            children: [
              {
                path: "faq",
                component: HelpComponent,
              },
              {
                path: "contact",
                component: ContactComponent,
              }
          ]
      },
      {
        path: "myaccount",
        loadChildren: () =>
          import("./user-dashboard/user-dashboard.module").then(
            (m) => m.UserDashboardModule
          ),
      },
      {
        path: "filltemplate/:templateId/:deponentId",
        component: FillTemplateComponent,
      },
      {
        path: "filltemplate/:templateId",
        component: FillTemplateComponent,
      },
      {
        path: "edittemplate/:affidavitId/:templateId/:price/:d/:cd",
        component: EditAffidavitComponent,
      },
      {
        path: "affidavitdesc/:templateId",
        component: TemplateDescriptionPageComponent,
      },
      {
        path: "home/templist",
        component: TemplateListingComponent,
      },
      {
        path: "forgotpassword",
        component: UserForgotComponent,
      },
      {
        path: "makePayment",
        component: PaymentCheckComponent,
        canActivate: [UserAuthGuardService],
      },
      {
        path: "registerationpayment",
        component: RegistrationPaymnetComponent,
      },
      {
        path: "home/card/templist",
        component: TemplateCardListingComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(userroutes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
