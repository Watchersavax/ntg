import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { MaterialModule } from "src/app/services/material-module";
import { DashboardComponent } from "./dashboard.component";
import { TemplatesComponent } from "./manageTemplates/templates.component";

import { DeleteTemplateDialogComponent } from "./manageTemplates/manageTemplatesDialog/delete-template-dialog/delete-template-dialog.component";
import { PreviewTemplateDialogComponent } from "./manageTemplates/manageTemplatesDialog/preview-template-dialog/preview-template-dialog.component";
import { EditTemplateDialogComponent } from "./manageTemplates/manageTemplatesDialog/edit-template-dialog/edit-template-dialog.component";
import { VersionPublishedTemplateDialogComponent } from "./manageTemplates/manageTemplatesDialog/version-published-template-dialog/version-published-template-dialog.component";
import { AddTemplateDialogComponent } from "./manageTemplates/manageTemplatesDialog/add-template-dialog/add-template-dialog.component";
import { AddTemplateVersionDialogComponent } from "./manageTemplates/manageTemplatesDialog/add-template-version-dialog/add-template-version-dialog.component";
import { AuthGuardService } from "src/app/services/auth-guard.service";
import { DesigntemplateComponent } from "./manageTemplates/manageTemplatesDialog/add-template-dialog/designtemplate/designtemplate.component";
import { DashboardRoutingModule } from "./dashboard-routing-module";
import { CreatequestionDialogComponent } from "./manageTemplates/manageTemplatesDialog/add-template-dialog/designtemplate/createquestion-dialog/createquestion-dialog.component";
import { TwoDigitDecimaNumberDirective } from "src/app/shared/directives/two-digit-decimal-directive";
import { DesignDescriptionPageDialogComponent } from "./manageTemplates/manageTemplatesDialog/design-description-page-dialog/design-description-page-dialog.component";

import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { CreateNewUserComponent } from "./manageUsers/manageUsers.dialog/create-new-user/create-new-user.component";
import { InnerUserComponent } from "./manageUsers/inner-user/inner-user.component";
import { EditUserDialogComponent } from "./manageUsers/manageUsers.dialog/edit-user-dialog/edit-user-dialog.component";
import { UserAffidavitComponent } from "./manageUsers/user-affidavit/user-affidavit.component";
import { SharedModule } from "src/app/services/sharedmodule";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { AdminPersonalComponent } from "./admin-personal/admin-personal.component";
import { FaqComponent } from "./manageApplication/faq/faq.component";
import { CreateFaqQueryComponent } from "./manageApplication/application.dialog/create-faq-query/create-faq-query.component";
import { EditFaqQueryComponent } from "./manageApplication/application.dialog/edit-faq-query/edit-faq-query.component";
import { CreateFaqCategoryComponent } from "./manageApplication/application.dialog/create-faq-category/create-faq-category.component";
import { EditFaqCategoryComponent } from "./manageApplication/application.dialog/edit-faq-category/edit-faq-category.component";
import { UserAffidavitPaymentDialogComponent } from "./manageUsers/manageUsers.dialog/user-affidavit-payment/user-affidavit-payment-dialog.component";
import { RegistrarUserGridComponent } from "src/app/court/registrar-user-grid/registrar-user-grid.component";
import { CreateRegistrarUserComponent } from "src/app/court/registrar-user-grid/manageregistrardialogs/create-registrar-user/create-registrar-user.component";
import { EditRegistrarUserComponent } from "src/app/court/registrar-user-grid/manageregistrardialogs/edit-registrar-user/edit-registrar-user.component";
import { ManageadminsComponent } from "./manageadmins/manageadmins.component";
import { CreateGeneralUserComponent } from "./manageUsers/create-general-user/create-general-user.component";
import { DeleteUserDialogComponent } from "./manageUsers/manageUsers.dialog/delete-user-dialog/delete-user-dialog.component";
import { EditGeneralUserComponent } from "./manageUsers/edit-general-user/edit-general-user.component";
import { RegistarAffidavitComponent } from "./manageUsers/registar-affidavit/registar-affidavit.component";
import { AdminTemplateComponent } from "./manageadmins/admin-template/admin-template.component";
import { SetSessionDialogComponent } from "src/app/court/registrar-user-grid/set-session-dialog/set-session-dialog.component";
import { ManagecategoriesComponent } from './managecategories/managecategories.component';
import { AddCategoryDialogComponent } from './managecategories/add-category-dialog/add-category-dialog.component';
import { AddSubcategoryDialogComponent } from './managecategories/add-subcategory-dialog/add-subcategory-dialog.component';
import { ManagesubcategoriesComponent } from './managecategories/managesubcategories/managesubcategories.component';
import { PdfViewerModule } from "ng2-pdf-viewer";

@NgModule({
  declarations: [
    TemplatesComponent,
    UserAffidavitComponent,
    DashboardComponent,
    DeleteTemplateDialogComponent,
    EditTemplateDialogComponent,
    PreviewTemplateDialogComponent,
    VersionPublishedTemplateDialogComponent,
    AddTemplateDialogComponent,
    AddTemplateVersionDialogComponent,
    DesigntemplateComponent,
    CreatequestionDialogComponent,
    TwoDigitDecimaNumberDirective,
    DesignDescriptionPageDialogComponent,
    InnerUserComponent,
    CreateNewUserComponent,
    EditUserDialogComponent,
    PasswordResetComponent,
    AdminPersonalComponent,
    FaqComponent,
    CreateFaqQueryComponent,
    EditFaqQueryComponent,
    CreateFaqCategoryComponent,
    EditFaqCategoryComponent,
    UserAffidavitPaymentDialogComponent,
    RegistrarUserGridComponent,
    CreateRegistrarUserComponent,
    EditRegistrarUserComponent,
    ManageadminsComponent,
    CreateGeneralUserComponent,
    DeleteUserDialogComponent,
    EditGeneralUserComponent,
    RegistarAffidavitComponent,
    AdminTemplateComponent,
    SetSessionDialogComponent,
    ManagecategoriesComponent,
    AddCategoryDialogComponent,
    AddSubcategoryDialogComponent,
    ManagesubcategoriesComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    FormsModule,
    CKEditorModule,
    InfiniteScrollModule,
    // RouterModule,
    PdfViewerModule,
  ],
  entryComponents: [
    DeleteTemplateDialogComponent,
    EditTemplateDialogComponent,
    VersionPublishedTemplateDialogComponent,
    AddTemplateDialogComponent,
    AddTemplateVersionDialogComponent,
    PreviewTemplateDialogComponent,
    CreatequestionDialogComponent,
    DesignDescriptionPageDialogComponent,
    CreateNewUserComponent,
    EditUserDialogComponent,
    CreateFaqQueryComponent,
    EditFaqQueryComponent,
    CreateFaqCategoryComponent,
    EditFaqCategoryComponent,
    UserAffidavitPaymentDialogComponent,
    CreateRegistrarUserComponent,
    EditRegistrarUserComponent,
    CreateGeneralUserComponent,
    DeleteUserDialogComponent,
    EditGeneralUserComponent,
    SetSessionDialogComponent,
    AddCategoryDialogComponent,
    AddSubcategoryDialogComponent
  ],
  providers: [AuthGuardService],

  exports: [
  ],
})
export class DashboardModule {}
