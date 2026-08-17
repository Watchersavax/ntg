import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";

/** Presentational OTP verification step. */
@Component({
  selector: "app-otp-verification",
  templateUrl: "./otp-verification.component.html",
  styleUrls: ["../../auth-shared.css"],
})
export class OtpVerificationComponent {
  @Input() formGroup: FormGroup;
  @Input() email = "";
  @Input() errorFlag = false;
  @Input() errorMessage = "";
  @Input() resendEnabled = false;
  @Input() resendTimer = 60;

  @Output() submitForm = new EventEmitter<void>();
  @Output() resend = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.submitForm.emit();
    }
  }

  keyPressEvent(event: any) {
    const pattern = /^[A-Za-z0-9]*$/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
