import { Component, Input } from "@angular/core";

/**
 * Shared legal footer rendering the Privacy Policy / Terms of Service links.
 * Replaces the three previously duplicated footers (auth/signup, user shell,
 * legal placeholder pages). Styling is selected via the `variant` input.
 */
@Component({
  selector: "app-legal-footer",
  templateUrl: "./legal-footer.component.html",
  styleUrls: ["./legal-footer.component.css"],
})
export class LegalFooterComponent {
  @Input() variant: "auth" | "shell" | "page" = "shell";
  @Input() showCopyright = true;
  @Input() openInNewTab = true;

  get target(): string | null {
    return this.openInNewTab ? "_blank" : null;
  }

  get rel(): string | null {
    return this.openInNewTab ? "noopener noreferrer" : null;
  }
}
