export enum SigningStatus {
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  SENT = "SENT",
  UNKNOWN = "UNKNOWN",
}

export function isCompletedSigningStatus(status: string): boolean {
  return status === SigningStatus.COMPLETED;
}

export function isRejectedSigningStatus(status: string): boolean {
  return status === SigningStatus.REJECTED;
}

export function isCancelledSigningStatus(status: string): boolean {
  return status === SigningStatus.CANCELLED;
}

export function isFailedSigningStatus(status: string): boolean {
  return status === SigningStatus.FAILED;
}

export function isFinishedSigningStatus(status: string): boolean {
  return isCompletedSigningStatus(status) || isRejectedSigningStatus(status)
    || isCancelledSigningStatus(status);
}

export function isTerminalSigningStatus(status: string): boolean {
  return isFinishedSigningStatus(status) || isFailedSigningStatus(status);
}

export function resolveSigningStatus(data: any, fallbackStatus: string): string {
  if (data && data.completed) {
    return SigningStatus.COMPLETED;
  }
  if (data && data.rejected) {
    return SigningStatus.REJECTED;
  }
  if (data && data.cancelled) {
    return SigningStatus.CANCELLED;
  }
  if (data && data.failed) {
    return SigningStatus.FAILED;
  }
  return data && data.signatureStatus ? data.signatureStatus : fallbackStatus;
}

export function requiresUserSignature(documentObj: any): boolean {
  return !!documentObj && !documentObj.isUploaded && !documentObj.isCaseRelated;
}

export function hasUserSigned(documentObj: any): boolean {
  return !!documentObj && (!!documentObj.signatureUserSignedAt || !!documentObj.userSigned);
}

export function canUserSignDocument(documentObj: any): boolean {
  return requiresUserSignature(documentObj)
    && !hasUserSigned(documentObj)
    && !documentObj.signatureRejectedAt
    && !isTerminalSigningStatus(documentObj.signatureStatus);
}

export function canSendToSign(documentObj: any): boolean {
  return !!documentObj && isFailedSigningStatus(documentObj.signatureStatus);
}
