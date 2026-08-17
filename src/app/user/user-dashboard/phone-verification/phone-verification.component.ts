import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserDetails } from '../../user-models/UserDetails';
import { PhoneVerificationDialogComponent } from '../phone-verification-dialog/phone-verification-dialog.component';
import { PhoneNumberUtil } from './phone-number.util';

@Component({
  selector: 'app-phone-verification',
  templateUrl: './phone-verification.component.html',
  styleUrls: ['./phone-verification.component.css']
})
export class PhoneVerificationComponent implements OnChanges {

  @Input() userId!: number;
  @Input() contact: string = '';
  @Input() savedContact: string = '';
  @Input() isPhoneVerified: boolean = false;
  @Output() verified = new EventEmitter<UserDetails>();

  errorMessage: string = '';
  private otpCooldownExpiresAt: number = 0;

  constructor(private dialog: MatDialog) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.contact) {
      this.errorMessage = '';
    }
  }

  openPhoneVerificationDialog() {
    this.errorMessage = '';

    if (this.isPhoneNumberChanged()) {
      this.errorMessage = 'Save changes before verifying the phone number';
      return;
    }

    if (!PhoneNumberUtil.isValid(this.savedContact)) {
      this.errorMessage = PhoneNumberUtil.formatHint;
      return;
    }

    const dialogRef = this.dialog.open(PhoneVerificationDialogComponent, {
      data: {
        userId: this.userId,
        contact: this.contact,
        cooldownExpiresAt: this.otpCooldownExpiresAt
      }
    });

    dialogRef.afterClosed().subscribe((result: { userDetails?: UserDetails; cooldownExpiresAt?: number }) => {
      if (!result) return;
      if (result.cooldownExpiresAt) {
        this.otpCooldownExpiresAt = result.cooldownExpiresAt;
      }
      if (result.userDetails) {
        this.verified.emit(result.userDetails);
      }
    });
  }

  canVerifyPhoneNumber(): boolean {
    return this.hasSavedPhoneNumber() && !this.isPhoneVerified && !this.isPhoneNumberChanged();
  }

  showPhoneVerificationWarning(): boolean {
    return this.hasSavedPhoneNumber() && (!this.isPhoneVerified || this.isPhoneNumberChanged());
  }

  getPhoneVerificationWarning(): string {
    if (this.errorMessage) {
      return this.errorMessage;
    }
    if (this.isPhoneNumberChanged()) {
      return 'Save changes before verifying the phone number';
    }
    return 'Phone number is not verified';
  }

  private isPhoneNumberChanged(): boolean {
    return this.savedContact !== undefined && this.contact !== this.savedContact;
  }

  private hasSavedPhoneNumber(): boolean {
    return this.savedContact !== undefined && this.savedContact !== null
      && this.savedContact.toString().trim() !== '';
  }
}
