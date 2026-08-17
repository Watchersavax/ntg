export function resolveDialogStatus(result: any): string {
  return typeof result === "string" ? result : result && result.status;
}
