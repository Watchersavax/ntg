import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CourtDataService } from "../court/courtdataservices/court-data.service";
import { SigningDocumentRequestDto } from "../shared/models/SigningDocumentRequestDto";

export interface SigningCreateResponse {
  affidavitId?: number;
  userSignatureRequired?: boolean;
  signatureProvider?: string;
  signatureDocumentId?: string;
  signatureItemId?: string;
  signatureStatus?: string;
  signatureUserRecipientId?: string;
  signatureRegistrarRecipientId?: string;
}

export interface SigningStatusResponse {
  affidavitId?: number;
  signatureStatus?: string;
  userSigned?: boolean;
  registrarSigned?: boolean;
  completed?: boolean;
  rejected?: boolean;
  cancelled?: boolean;
  failed?: boolean;
  signatureRejectedAt?: string;
  signatureRejectedByRole?: string;
  signatureUserSignedAt?: string;
}

export interface SigningEmbedResponse {
  affidavitId?: number;
  recipientKey?: string;
  signingUrl?: string;
  signatureStatus?: string;
}

@Injectable({
  providedIn: "root",
})
export class SigningDocumentService {
  constructor(
    private http: HttpClient,
    private courtdataservice: CourtDataService
  ) {}

  createSigningDocument(
    signingDocumentRequest: SigningDocumentRequestDto
  ): Promise<SigningCreateResponse> {
    const url = this.courtdataservice.BASE_URL_USER_TEMPLATE + "/signing/create";
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.requestData<SigningCreateResponse>(this.http.post(url, signingDocumentRequest, { headers }));
  }

  downloadSignedDocument(affidavitId: number) {
    const url = this.courtdataservice.BASE_URL_USER_TEMPLATE + "/downloadSignedDocument/" + affidavitId;
    return this.http.get(url, { responseType: "blob" });
  }

  getSigningStatus(affidavitId: number): Promise<SigningStatusResponse> {
    const url = this.courtdataservice.BASE_URL_USER_TEMPLATE + "/signing/status/" + affidavitId;
    return this.requestData<SigningStatusResponse>(this.http.get(url));
  }

  getUserSigningEmbed(affidavitId: number): Promise<SigningEmbedResponse> {
    return this.getSigningEmbed("user", affidavitId);
  }

  getRegistrarSigningEmbed(affidavitId: number): Promise<SigningEmbedResponse> {
    return this.getSigningEmbed("registrar", affidavitId);
  }

  rejectSigningDocument(affidavitId: number, registrarComment: string): Promise<void> {
    const url = this.courtdataservice.BASE_URL_USER_TEMPLATE + "/signing/reject";
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    const body = { affidavitId: affidavitId, registrarComment: registrarComment };
    return this.requestData<any>(this.http.post(url, body, { headers })).then(() => undefined);
  }

  private getSigningEmbed(type: string, affidavitId: number): Promise<SigningEmbedResponse> {
    const url = this.courtdataservice.BASE_URL_USER_TEMPLATE + "/signing/embed/" + type + "/" + affidavitId;
    return this.requestData<SigningEmbedResponse>(this.http.get(url));
  }

  private requestData<T>(request): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      request.subscribe(
        (response) => {
          const payload = this.successPayload(response, reject);
          if (!payload) {
            return;
          }
          resolve(payload);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  private successPayload(response, reject): any {
    if (response && response["success"] === false) {
      reject(new Error(this.errorMessage(response)));
      return null;
    }
    const payload = response && response["data"] ? response["data"] : response;
    if (!payload) {
      reject(new Error("Signing service returned an empty response"));
      return null;
    }
    return payload;
  }

  private errorMessage(response): string {
    if (response && response["error"] && response["error"]["error"]) {
      return response["error"]["error"];
    }
    if (response && response["error"] && response["error"]["message"]) {
      return response["error"]["message"];
    }
    if (response && response["message"]) {
      return response["message"];
    }
    return "Signing request failed";
  }
}
