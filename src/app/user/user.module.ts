import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserComponent } from "./user.component";
import { MaterialModule } from "../services/material-module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UserRoutingModule } from "./user.routing.module";
import { FillTemplateComponent } from "./fill-template/fill-template.component";
import { QuestionDirective } from "../shared/directives/question-directive";
import { UserauthComponent } from "./user-auth/userauth-dialog/userauth.component";
import { TemplateFinalViewComponent } from "./template-final-view/template-final-view.component";
import { TemplateListingComponent } from "./template-listing/template-listing.component";
import { UserSignupComponent } from "./user-auth/user-signup/user-signup.component";
import { UserForgotComponent } from "./user-auth/user-forgot/user-forgot.component";
import { EditAffidavitComponent } from "./edit-affidavit/edit-affidavit.component";
import { CustomFilenameDialogComponent } from "./custom-filename-dialog/custom-filename-dialog.component";
import { TemplateDescriptionPageComponent } from "./template-description-page/template-description-page.component";
import { SharedModule } from "../services/sharedmodule";
import { HelpComponent } from "./help-centre/help/help.component";
import { DeponentComponent } from "./deponent/deponent.component";
import { NinValidationDialogComponent } from "./nin-validation-dialog/nin-validation-dialog.component";
import { TemplateCardListingComponent } from "./template-card-listing/template-card-listing.component";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { HowItWorksComponent } from "./how-it-works/how-it-works.component";
import { HelpCentreComponent } from "./help-centre/help-centre.component";
import { AgentsComponent } from "./user-profiles/agents/agents.component";
import { CorporateComponent } from "./user-profiles/corporate/corporate.component";
import { IndividualComponent } from "./user-profiles/individual/individual.component";
import { UserProfilesComponent } from "./user-profiles/user-profiles.component";
import { ContactComponent } from "./help-centre/contact/contact.component";
import { MatTooltipModule } from "@angular/material";
import { PriceSelectionDialogComponent } from "./price-selection-dialog/price-selection-dialog.component";
import { CaseRelatedAffidavitsComponent } from "./case-related-affidavits/case-related-affidavits.component";
import { LegalFooterModule } from "../shared/legal-footer/legal-footer.module";
import { PasswordFieldComponent } from "./user-auth/user-signup/components/password-field/password-field.component";
import { LoginFormComponent } from "./user-auth/user-signup/components/login-form/login-form.component";
import { AccountTypeStepComponent } from "./user-auth/user-signup/components/account-type-step/account-type-step.component";
import { RegisterFormComponent } from "./user-auth/user-signup/components/register-form/register-form.component";
import { OtpVerificationComponent } from "./user-auth/user-signup/components/otp-verification/otp-verification.component";
import { ForgotFormComponent } from "./user-auth/user-signup/components/forgot-form/forgot-form.component";

@NgModule({
  declarations: [
    UserComponent,
    FillTemplateComponent,
    QuestionDirective,
    UserauthComponent,
    TemplateFinalViewComponent,
    TemplateListingComponent,
    UserSignupComponent,
    UserForgotComponent,
    EditAffidavitComponent,
    CustomFilenameDialogComponent,
    TemplateDescriptionPageComponent,
    HelpComponent,
    HowItWorksComponent,
    DeponentComponent,
    NinValidationDialogComponent,
    TemplateCardListingComponent,
    UserProfilesComponent,
    ContactComponent,
    HelpCentreComponent,
    IndividualComponent,
    CorporateComponent,
    AgentsComponent,
    PriceSelectionDialogComponent,
    CaseRelatedAffidavitsComponent,
    PasswordFieldComponent,
    LoginFormComponent,
    AccountTypeStepComponent,
    RegisterFormComponent,
    OtpVerificationComponent,
    ForgotFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    PdfViewerModule,
    MatTooltipModule,
    LegalFooterModule
  ],
  entryComponents: [
    UserauthComponent,
    TemplateFinalViewComponent,
    CustomFilenameDialogComponent,
    DeponentComponent,
    NinValidationDialogComponent,
    PriceSelectionDialogComponent,
    CaseRelatedAffidavitsComponent
  ],
})
export class UserModule {}
