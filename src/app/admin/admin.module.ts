import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminComponent } from "./admin.component";
import { MaterialModule } from "../services/material-module";

import { ReactiveFormsModule } from "@angular/forms";
import { AdminRoutingModule } from './admin-routing-module';
import { PdfViewerModule } from "ng2-pdf-viewer";

@NgModule({
  declarations: [AdminComponent],
  imports: [
    CommonModule,
    MaterialModule,
    // RouterModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    PdfViewerModule
  ]
})
export class AdminModule {}
