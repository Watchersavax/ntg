import * as moment from "moment";

export function sortDocumentsByRejectedAt<T extends { signatureRejectedAt?: string }>(documents: T[]): T[] {
  return documents.sort((left, right) => rejectedTimestamp(right) - rejectedTimestamp(left));
}

function rejectedTimestamp(documentObj: { signatureRejectedAt?: string }): number {
  if (!documentObj || !documentObj.signatureRejectedAt) {
    return 0;
  }
  const rejectedAt = moment(documentObj.signatureRejectedAt);
  return rejectedAt.isValid() ? rejectedAt.valueOf() : 0;
}
