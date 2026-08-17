import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";

/** Presentational forgot-password step shown inside the auth flow. */
@Component({
  selector: "app-forgot-form",
  templateUrl: "./forgot-form.component.html",
  styleUrls: ["../../auth-shared.css"],
})
export class ForgotFormComponent {
  @Input() formGroup: FormGroup;
  @Input() errorFlag = false;
  @Input() errorMessage = "";
  @Input() success = false;

  @Output() submitForm = new EventEmitter<void>();
  @Output() login = new EventEmitter<void>();
  @Output() clearError = new EventEmitter<void>();
  @Output() keyPress = new EventEmitter<void>();

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.submitForm.emit();
    }
  }
}
