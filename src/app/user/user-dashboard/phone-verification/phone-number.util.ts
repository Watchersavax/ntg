export class PhoneNumberUtil {

  static formatHint: string = 'Please enter a valid phone number, for example +2348035240800';

  static isValid(phoneNumber: string): boolean {
    if (!phoneNumber) {
      return false;
    }

    const digits = phoneNumber.toString().replace(/[^0-9]/g, '');
    return (digits.length === 11 && digits.charAt(0) === '0')
      || (digits.length === 13 && digits.indexOf('234') === 0 && digits.indexOf('2340') !== 0);
  }
}
