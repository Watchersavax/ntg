import * as moment from "moment";

const WAT_OFFSET_MINUTES = 60;
const EXPLICIT_TIME_ZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i;
export const APPOINTMENT_DATE_TIME_FORMAT = "YYYY-MM-DD hh:mm a";

export function formatAppointmentTimeWat(value: any, format: string = APPOINTMENT_DATE_TIME_FORMAT): string {
  const parsed = parseAppointmentMomentWat(value);
  return parsed && parsed.isValid() ? parsed.format(format) : "";
}

function parseAppointmentMomentWat(value: any): moment.Moment {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return moment(value).utcOffset(WAT_OFFSET_MINUTES);
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  const parsed = moment(raw);
  return EXPLICIT_TIME_ZONE_PATTERN.test(raw)
    ? parsed.utcOffset(WAT_OFFSET_MINUTES)
    : parsed.utcOffset(WAT_OFFSET_MINUTES, true);
}
