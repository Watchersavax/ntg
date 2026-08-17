export interface AppointmentJoinWindowInput {
  meetingTiming: any;
  meetingEndTiming: any;
  cancelled?: boolean;
  completed?: boolean;
  joinUrl?: string;
  now?: Date | number;
  isAppointmentProduction?: boolean;
}

export interface AppointmentJoinStatus {
  btnValue: string;
  isBtnDisable: boolean;
  canJoin: boolean;
}

const BUFFER_MS = 10 * 60 * 1000;

export function resolveAppointmentJoinStatus(input: AppointmentJoinWindowInput): AppointmentJoinStatus {
  const disabledJoin = {
    btnValue: "Join",
    isBtnDisable: true,
    canJoin: false,
  };

  if (!input) {
    return disabledJoin;
  }

  if (input.cancelled) {
    return {
      btnValue: "Cancelled",
      isBtnDisable: true,
      canJoin: false,
    };
  }

  if (input.completed) {
    return {
      btnValue: "Completed",
      isBtnDisable: true,
      canJoin: false,
    };
  }

  const isAppointmentProduction = input.isAppointmentProduction !== false;
  if (!isAppointmentProduction) {
    return {
      btnValue: "Join",
      isBtnDisable: !input.joinUrl,
      canJoin: !!input.joinUrl,
    };
  }

  const start = parseRequiredDate(input.meetingTiming);
  const end = parseRequiredDate(input.meetingEndTiming);
  if (isNaN(start) || isNaN(end)) {
    return disabledJoin;
  }

  const now = typeof input.now === "number" ? input.now : (input.now ? input.now.getTime() : new Date().getTime());
  const inJoinWindow = now >= start - BUFFER_MS && now <= end + BUFFER_MS;

  return {
    btnValue: "Join",
    isBtnDisable: !(inJoinWindow && !!input.joinUrl),
    canJoin: inJoinWindow && !!input.joinUrl,
  };
}

function parseRequiredDate(value: any): number {
  if (value === null || value === undefined || value === "") {
    return NaN;
  }
  return new Date(value).getTime();
}
