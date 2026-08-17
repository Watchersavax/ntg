/**
 * A recreation context is only usable once the server has told us which affidavit is
 * being recreated, so its presence is what puts a screen into recreation mode.
 */
export function isRecreationContext(recreationContext: any): boolean {
  return !!(recreationContext && recreationContext.sourceAffidavitId);
}
