import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LegalFooterComponent } from "./legal-footer.component";

/**
 * Lightweight module exposing the shared {@link LegalFooterComponent} so it can
 * be reused by feature modules (AppModule, UserModule) without pulling in the
 * heavier app-wide SharedModule.
 */
@NgModule({
  declarations: [LegalFooterComponent],
  imports: [CommonModule],
  exports: [LegalFooterComponent],
})
export class LegalFooterModule {}
