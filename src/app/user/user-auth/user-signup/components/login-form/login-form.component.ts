import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

/**
 * Presentational login form. All validation, the backend call and role-based
 * navigation stay in the container (UserSignupComponent); this component only
 * renders the form and emits user intents.
 */
@Component({
  selector: "app-login-form",
  templateUrl: "./login-form.component.html",
  styleUrls: ["../../auth-shared.css"],
})
export class LoginFormComponent {
  @Input() formGroup: FormGroup;
  @Input() errorFlag = false;
  @Input() errorMessage = "";

  @Output() submitForm = new EventEmitter<void>();
  @Output() forgot = new EventEmitter<void>();
  @Output() signup = new EventEmitter<void>();
  @Output() clearError = new EventEmitter<void>();

  get passwordControl(): FormControl {
    return this.formGroup.get("password") as FormControl;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.submitForm.emit();
    }
  }
}
