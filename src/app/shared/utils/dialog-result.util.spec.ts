import { resolveDialogStatus } from "./dialog-result.util";

describe("dialog-result.util", () => {
  it("returns string dialog results as-is", () => {
    expect(resolveDialogStatus("Scheduled")).toBe("Scheduled");
  });

  it("returns status from object dialog results", () => {
    expect(resolveDialogStatus({ status: "SigningFailed" })).toBe("SigningFailed");
  });

  it("returns undefined for empty dialog results", () => {
    expect(resolveDialogStatus(null)).toBeUndefined();
    expect(resolveDialogStatus(undefined)).toBeUndefined();
  });
});
