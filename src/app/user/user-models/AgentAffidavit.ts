export class AgentAffidavit{
    userAffidavitId: number;
    templateVersionId: number;
    status: string;
    templateName: string;
    price: number;
    userAffidavitCustomName: string;
    registrarStatus: string;
    registrarId: number;
    registrarName: string;
    registrarCourtName: string
    actionDateString: string;
    deponentId: number;
    deponentFirstName: string;
    deponentLastName: string;
    deponentEmail: string;
    deponentMobile: number;
    htmlValue: string;
    userid
    disablePreviewFlag
    isUploaded:Boolean;
    meetingTiming: string;
    meetingEndTiming: string;
    missedAppointment: Boolean;
    canCancelAppointment: boolean;
    isExpress: Boolean;
    templateFastTrackPrice: number;
    templatePrice: number;
    signatureStatus: string;
    disableSendToSign: boolean;
    registrarComments: string;
    signatureRejectedAt: string;
    signatureRejectedByRole: string;
    signatureUserSignedAt: string;
    appointmentId: number;
    attendeeId: number;
    appointmentJoinUrl: string;
    appointmentCancelled: boolean;
    appointmentCompleted: boolean;
    canRecreate: boolean;
    recreateUntil: string;
    creationMethod: string;
}
