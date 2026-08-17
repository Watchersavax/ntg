import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { SignupRequestModel } from "src/app/shared/models/SignupRequestModel";
import { AccountTypeOption } from "../../auth.models";

/**
 * Presentational registration form (second signup step). Validation, the
 * availability check and the OTP/payment transitions stay in the container; this
 * component renders the fields and emits user intents.
 */
@Component({
  selector: "app-register-form",
  templateUrl: "./register-form.component.html",
  styleUrls: ["../../auth-shared.css"],
})
export class RegisterFormComponent {
  @Input() formGroup: FormGroup;
  @Input() formType = 3;
  @Input() proceedToPayment = false;
  @Input() selectedAccountType: AccountTypeOption;
  @Input() registerRequestModel: SignupRequestModel;
  @Input() errorFlag = false;
  @Input() errorMessage = "";

  @Output() submitForm = new EventEmitter<void>();
  @Output() editDetails = new EventEmitter<void>();
  @Output() registerEvent = new EventEmitter<number>();
  @Output() login = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() clearError = new EventEmitter<void>();

  get passwordControl(): FormControl {
    return this.formGroup.get("password") as FormControl;
  }

  get repasswordControl(): FormControl {
    return this.formGroup.get("repassword") as FormControl;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.submitForm.emit();
    }
  }

  phoneKeyPress(event: any) {
    const inputChar = String.fromCharCode(event.charCode);

    // Nigerian national number: digits only. The +234 country code is shown as a
    // fixed prefix and prepended on submit.
    if (/[0-9]/.test(inputChar)) {
      return;
    }

    event.preventDefault();
  }

  keyPressEvent(event: any) {
    const pattern = /^[A-Za-z0-9]*$/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  handlePasteEvent(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData("text");
    const isValid = /^[a-zA-Z0-9]*$/.test(pastedText);
    if (!isValid) {
      event.preventDefault();
      const target = event.target as HTMLInputElement;
      const controlName = target && target.getAttribute("formControlName");
      if (controlName && this.formGroup.get(controlName)) {
        this.formGroup.get(controlName).setValue("");
      }
    }
  }
}
