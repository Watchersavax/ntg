export class UserAffidavitSaveRequest {
	userAffidavitId?: number;
	userId?: number;
	templateVersionId?: number;
	htmlValue?: string | null;
	attributeValueList?: string | null;
	groupStepsArray?: string | null;
	status?: string;
	templateName?: string;
	templateId?: number;
	userAffidavitCustomName?: string | null;
	deponentId?: number;
	isUploaded?: boolean;
	courtId?: number;
	pdfData?: string | ArrayBuffer | null;
	isExpress?: boolean;
	templatePrice?: number;
	templateFastTrackPrice?: number;
	isCaseRelated?: boolean;
}
