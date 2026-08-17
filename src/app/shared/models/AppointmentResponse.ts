import { UserDetails } from "src/app/user/user-models/UserDetails";
import { AttendeeResponse } from "./AttendeeResponse";

export class AppointmentResponse{
    appointmentId: number;
    registrar: UserDetails;
    meetingTiming: string;
    attendees : AttendeeResponse[];
    affidavitCount: number;
    btnValue:string;
    formattedDate: string;
    completed: boolean;
    cancelled: boolean;
    joinUrl: string;
    isBtnDisable: boolean;
    meetingEndTiming: string;
}