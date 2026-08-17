import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./services/material-module";
import { BusinessModule } from "./business/business.module";
import { PagenotfoundComponent } from "./shared/pagenotfound/pagenotfound.component";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "./services/auth.interceptor";
import { LoadingscreenComponent } from "./shared/loadingscreen/loadingscreen.component";
import { VerificationComponent } from "./verification/verification.component";
import { ResetpasswordComponent } from "./resetpassword/resetpassword.component";
import { ReactiveFormsModule } from "@angular/forms";
import { ContextMenuModule } from "primeng/components/contextmenu/contextmenu";

import { AppRoutingModule } from "./app-routing.module";
import { AlertdialogComponent } from "./shared/alertdialog/alertdialog.component";
import { GlobalLoginComponent } from "./global-login/global-login.component";
import { RegisterComponent } from "./register/register.component";
import { ForgotComponent } from "./forgotPassword/forgot.component";
import { LoadingComponent } from "./shared/loading/loading.component";
import { ToastrModule } from "ngx-toastr";
import { CurrencyPipe } from "@angular/common";
import { TermsOfServicePlaceholderComponent } from "./shared/legal-placeholder/terms-of-service-placeholder.component";
import { PrivacyPolicyPlaceholderComponent } from "./shared/legal-placeholder/privacy-policy-placeholder.component";
import { LegalFooterModule } from "./shared/legal-footer/legal-footer.module";

@NgModule({
  declarations: [
    AppComponent,
    PagenotfoundComponent,
    LoadingscreenComponent,
    VerificationComponent,
    ResetpasswordComponent,
    ForgotComponent,
    AlertdialogComponent,
    GlobalLoginComponent,
    RegisterComponent,
    LoadingComponent,
    TermsOfServicePlaceholderComponent,
    PrivacyPolicyPlaceholderComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    BusinessModule,
    HttpClientModule,
    ReactiveFormsModule,
    ContextMenuModule,
    ToastrModule.forRoot(),
    LegalFooterModule,
  ],
  entryComponents: [AlertdialogComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },CurrencyPipe
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
