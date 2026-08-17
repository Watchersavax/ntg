import {
  canSendToSign,
  canUserSignDocument,
  isTerminalSigningStatus,
  resolveSigningStatus,
  SigningStatus,
} from "./signing-status.util";

describe("signing-status.util", () => {
  it("marks completed, rejected, cancelled and failed as terminal", () => {
    expect(isTerminalSigningStatus(SigningStatus.COMPLETED)).toBe(true);
    expect(isTerminalSigningStatus(SigningStatus.REJECTED)).toBe(true);
    expect(isTerminalSigningStatus(SigningStatus.CANCELLED)).toBe(true);
    expect(isTerminalSigningStatus(SigningStatus.FAILED)).toBe(true);
    expect(isTerminalSigningStatus(SigningStatus.SENT)).toBe(false);
  });

  it("allows user signing only for unsigned template documents", () => {
    expect(canUserSignDocument({
      isUploaded: false,
      isCaseRelated: false,
      signatureStatus: SigningStatus.SENT,
    })).toBe(true);
    expect(canUserSignDocument({
      isUploaded: false,
      isCaseRelated: false,
      signatureStatus: SigningStatus.SENT,
      signatureUserSignedAt: "2026-07-06T10:00:00Z",
    })).toBe(false);
    expect(canUserSignDocument({
      isUploaded: true,
      isCaseRelated: false,
      signatureStatus: SigningStatus.SENT,
    })).toBe(false);
    expect(canUserSignDocument({
      isUploaded: false,
      isCaseRelated: false,
      signatureStatus: SigningStatus.FAILED,
    })).toBe(false);
  });

  it("allows send to sign only for failed signing status", () => {
    expect(canSendToSign({ signatureStatus: SigningStatus.FAILED })).toBe(true);
    expect(canSendToSign({ signatureStatus: SigningStatus.SENT })).toBe(false);
  });

  it("resolves signing status from boolean response flags", () => {
    expect(resolveSigningStatus({ completed: true }, SigningStatus.SENT)).toBe(SigningStatus.COMPLETED);
    expect(resolveSigningStatus({ rejected: true }, SigningStatus.SENT)).toBe(SigningStatus.REJECTED);
    expect(resolveSigningStatus({ cancelled: true }, SigningStatus.SENT)).toBe(SigningStatus.CANCELLED);
    expect(resolveSigningStatus({ failed: true }, SigningStatus.SENT)).toBe(SigningStatus.FAILED);
    expect(resolveSigningStatus({ signatureStatus: SigningStatus.UNKNOWN }, SigningStatus.SENT))
      .toBe(SigningStatus.UNKNOWN);
    expect(resolveSigningStatus({}, SigningStatus.SENT)).toBe(SigningStatus.SENT);
  });
});
