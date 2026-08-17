import { UserDetails } from "src/app/user/user-models/UserDetails";
import { AppointmentResponse } from "./AppointmentResponse";
import { UserAffidavit } from "src/app/user/user-models/UserAffidavit";

export class AttendeeResponse {
  attendeeId: number;
  user: UserDetails;
  userAffidavit: UserAffidavit;
  appointmentDto: AppointmentResponse;
  btnValue: string;
  completed: boolean;
  isBtnDisable: boolean;
}
