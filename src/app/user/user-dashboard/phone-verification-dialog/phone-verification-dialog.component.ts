import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserdetailsService } from '../../userservices/userdetails.service';
import { PhoneNumberUtil } from '../phone-verification/phone-number.util';

@Component({
  selector: 'app-phone-verification-dialog',
  templateUrl: './phone-verification-dialog.component.html',
  styleUrls: ['./phone-verification-dialog.component.css']
})
export class PhoneVerificationDialogComponent implements OnInit, OnDestroy {

  otp: string = '';
  otpSent: boolean = false;
  sendingOtp: boolean = false;
  verifyingOtp: boolean = false;
  resendCooldownSeconds: number = 0;
  errorMessage: string = '';
  private resendCooldownInterval: any;
  private readonly resendCooldownDurationSeconds: number = 60;
  private readonly sendOtpErrorMessage: string = 'Something went wrong, please try again later.';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PhoneVerificationDialogComponent>,
    private userdetailsService: UserdetailsService
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit() {
    const remainingMs = (this.data.cooldownExpiresAt || 0) - Date.now();
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    if (remainingSeconds > 0) {
      this.startResendCooldown(remainingSeconds);
    } else {
      this.sendOtp();
    }
  }

  ngOnDestroy() {
    this.stopResendCooldown();
  }

  sendOtp() {
    if (this.sendingOtp || this.verifyingOtp || this.resendCooldownSeconds > 0) {
      return;
    }

    this.errorMessage = '';
    if (!PhoneNumberUtil.isValid(this.data.contact)) {
      this.errorMessage = PhoneNumberUtil.formatHint;
      return;
    }

    this.otp = '';
    this.sendingOtp = true;
    this.startResendCooldown();
    this.userdetailsService.sendPhoneVerificationOtp().subscribe((response: any) => {
      this.sendingOtp = false;
      if (response.success) {
        this.otpSent = true;
        return;
      }
      this.errorMessage = this.sendOtpErrorMessage;
    }, () => {
      this.sendingOtp = false;
      this.errorMessage = this.sendOtpErrorMessage;
    });
  }

  getResendButtonLabel(): string {
    if (this.sendingOtp) {
      return this.otpSent ? 'Resending OTP...' : 'Sending OTP...';
    }
    if (this.resendCooldownSeconds > 0) {
      return 'Resend OTP (' + this.resendCooldownSeconds + 's)';
    }
    return 'Resend OTP';
  }

  verifyOtp() {
    if (!this.otp || this.otp.length !== 6) {
      this.errorMessage = 'Enter the 6 digit OTP';
      return;
    }

    this.errorMessage = '';
    this.verifyingOtp = true;
    this.userdetailsService.verifyPhoneOtp(this.otp).subscribe((response: any) => {
      this.verifyingOtp = false;
      if (response.success) {
        this.dialogRef.close({ userDetails: response.data, cooldownExpiresAt: this.getCooldownExpiresAt() });
        return;
      }
      this.errorMessage = this.getErrorMessage(response, 'Invalid OTP');
    }, error => {
      this.verifyingOtp = false;
      this.errorMessage = this.getErrorMessage(error, 'Invalid OTP');
    });
  }

  close() {
    this.dialogRef.close({ cooldownExpiresAt: this.getCooldownExpiresAt() });
  }

  private getCooldownExpiresAt(): number {
    return this.resendCooldownSeconds > 0 ? Date.now() + this.resendCooldownSeconds * 1000 : 0;
  }

  keyPress(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  private getErrorMessage(response: any, fallback: string): string {
    if (response && response.error && response.error.message) {
      return response.error.message;
    }
    if (response && response.error && response.error.error && response.error.error.message) {
      return response.error.error.message;
    }
    if (response && response.error && typeof response.error.error === 'string') {
      return response.error.error;
    }
    if (response && response.message) {
      return response.message;
    }
    if (response && typeof response.error === 'string') {
      return response.error;
    }
    return fallback;
  }

  private startResendCooldown(seconds: number = this.resendCooldownDurationSeconds) {
    this.stopResendCooldown();
    this.resendCooldownSeconds = seconds;
    this.resendCooldownInterval = setInterval(() => {
      this.resendCooldownSeconds -= 1;
      if (this.resendCooldownSeconds <= 0) {
        this.stopResendCooldown();
      }
    }, 1000);
  }

  private stopResendCooldown() {
    if (this.resendCooldownInterval) {
      clearInterval(this.resendCooldownInterval);
      this.resendCooldownInterval = null;
    }
    if (this.resendCooldownSeconds < 0) {
      this.resendCooldownSeconds = 0;
    }
  }

}
