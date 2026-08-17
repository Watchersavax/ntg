export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  // carry a stale extension (or none). Normalize to a single ".pdf".
  // The downloaded content is always a signed PDF; callers pass a display name that may
  anchor.href = url;
  const base = (filename || "signed-document").replace(/\.(pdf|docx)$/i, "");
  anchor.download = `${base}.pdf`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
