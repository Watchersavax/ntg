import { NgModule } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
import { BusinessComponent } from "./business/business.component";
import { PagenotfoundComponent } from "./shared/pagenotfound/pagenotfound.component";
import { VerificationComponent } from './verification/verification.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { TermsOfServicePlaceholderComponent } from './shared/legal-placeholder/terms-of-service-placeholder.component';
import { PrivacyPolicyPlaceholderComponent } from './shared/legal-placeholder/privacy-policy-placeholder.component';

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/user/home",
    pathMatch: "full"
  },
  {
    path: "user",
    loadChildren: () => import("./user/user.module").then(m => m.UserModule)
  },
  {
    path: "admin",
    loadChildren: () => import("./admin/admin.module").then(m => m.AdminModule)
  },
  {
    path: "business",
    component: BusinessComponent
  },
  {
    path: "court",
    loadChildren: () => import("./court/court.module").then(m => m.CourtModule)
  },
  {
    path:"api/auth/verify",
    component:VerificationComponent
  },
  {
    path:"api/auth/setPassword",
    component:ResetpasswordComponent
  },
  {
    path: "terms-of-service",
    component: TermsOfServicePlaceholderComponent
  },
  {
    path: "privacy-policy",
    component: PrivacyPolicyPlaceholderComponent
  },
  {
    path: '404',
    component: PagenotfoundComponent
  },
  {
    path: '**',
     redirectTo: '/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
