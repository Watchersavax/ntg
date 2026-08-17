import { Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";

/**
 * Presentational password input with a show/hide toggle. Replaces the markup
 * that was previously duplicated three times in the auth template (login
 * password, signup password, signup confirm-password). The `hide` state is
 * owned by the parent form so a single toggle can drive several fields exactly
 * as before.
 */
@Component({
  selector: "app-password-field",
  templateUrl: "./password-field.component.html",
  styleUrls: ["../../auth-shared.css", "./password-field.component.css"],
})
export class PasswordFieldComponent {
  @Input() control: FormControl;
  @Input() label: string;
  @Input() inputId: string;
  @Input() placeholder = "";
  @Input() hint: string | null = null;
  @Input() disabled = false;
  /** Show the 4-segment strength meter beneath the field (e.g. "create password"). */
  @Input() showStrength = false;

  /** Visibility is owned per-field, so each toggle only reveals its own input. */
  hide = true;

  readonly strengthSegments = [0, 1, 2, 3];

  /**
   * Lightweight, dependency-free strength score (0-4): one point each for a
   * reasonable length, a longer length, mixed letter case, a digit and a
   * special character.
   */
  get strengthScore(): number {
    const value = this.control && this.control.value ? this.control.value : "";
    if (!value) {
      return 0;
    }
    let score = 0;
    if (value.length >= 6) {
      score++;
    }
    if (value.length >= 10) {
      score++;
    }
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
      score++;
    }
    if (/\d/.test(value)) {
      score++;
    }
    if (/[^A-Za-z0-9]/.test(value)) {
      score++;
    }
    return Math.min(score, 4);
  }

  get strengthLabel(): string {
    switch (this.strengthScore) {
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  }
}
