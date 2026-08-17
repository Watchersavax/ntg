import { resolveAppointmentJoinStatus } from "./appointment-join-window.util";

describe("resolveAppointmentJoinStatus", () => {
  const start = new Date("2026-07-29T10:00:00Z").getTime();
  const end = new Date("2026-07-29T10:30:00Z").getTime();

  it("enables join from 10 minutes before start through 10 minutes after end", () => {
    expect(statusAt(start - 10 * 60 * 1000).canJoin).toBeTruthy();
    expect(statusAt(start + 5 * 60 * 1000).canJoin).toBeTruthy();
    expect(statusAt(end + 10 * 60 * 1000).canJoin).toBeTruthy();
  });

  it("disables join outside the buffered appointment window", () => {
    expect(statusAt(start - 10 * 60 * 1000 - 1).canJoin).toBeFalsy();
    expect(statusAt(end + 10 * 60 * 1000 + 1).canJoin).toBeFalsy();
  });

  it("enables join outside the production window when appointment production mode is off", () => {
    expect(statusAt(start - 60 * 60 * 1000, {
      isAppointmentProduction: false,
    }).canJoin).toBeTruthy();
    expect(statusAt(end + 60 * 60 * 1000, {
      isAppointmentProduction: false,
    }).canJoin).toBeTruthy();
  });

  it("disables join for cancelled or completed appointments", () => {
    expect(statusAt(start, { cancelled: true }).btnValue).toBe("Cancelled");
    expect(statusAt(start, { completed: true }).btnValue).toBe("Completed");
    expect(statusAt(start - 60 * 60 * 1000, {
      cancelled: true,
      isAppointmentProduction: false,
    }).canJoin).toBeFalsy();
    expect(statusAt(start - 60 * 60 * 1000, {
      completed: true,
      isAppointmentProduction: false,
    }).canJoin).toBeFalsy();
  });

  it("disables join when start time, end time, or meeting url is missing", () => {
    expect(resolveAppointmentJoinStatus({
      meetingTiming: null,
      meetingEndTiming: new Date(end).toISOString(),
      joinUrl: "https://meet.example",
      now: start,
    }).canJoin).toBeFalsy();

    expect(resolveAppointmentJoinStatus({
      meetingTiming: new Date(start).toISOString(),
      meetingEndTiming: null,
      joinUrl: "https://meet.example",
      now: start,
    }).canJoin).toBeFalsy();

    expect(statusAt(start, { joinUrl: null }).canJoin).toBeFalsy();
  });

  function statusAt(now: number, overrides: any = {}) {
    return resolveAppointmentJoinStatus({
      meetingTiming: new Date(start).toISOString(),
      meetingEndTiming: new Date(end).toISOString(),
      cancelled: false,
      completed: false,
      joinUrl: "https://meet.example",
      now: now,
      ...overrides,
    });
  }
});
