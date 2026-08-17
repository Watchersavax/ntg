import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";

const UPLOAD_FAILED_MESSAGE = "Upload failed.";

@Injectable({
  providedIn: "root"
})
export class AffidavitRecreationService {
  private readonly urls = environment.url + "user/affidavit/recreation/";

  constructor(private http: HttpClient, private router: Router) {}

  getContext(sourceAffidavitId: number) {
    return this.http.get(this.urls + sourceAffidavitId + "/context");
  }

  recreateTemplate(request: any) {
    return this.http.post(this.urls + "template", request);
  }

  /**
   * Posts a recreated upload and reports the outcome as an error message, or null when
   * the affidavit was recreated. Shared by the user and the agent upload dialogs, which
   * differ only in how they show the error and where they navigate afterwards.
   */
  submitUploadRecreation(formData: FormData): Observable<string> {
    return this.http.post(this.urls + "upload", formData).pipe(
      map((response: any) => {
        if (response && response.success) {
          return null;
        }
        return response && response.error && response.error.message
          ? response.error.message
          : UPLOAD_FAILED_MESSAGE;
      }),
      catchError(() => of(UPLOAD_FAILED_MESSAGE))
    );
  }

  navigateToVerifiedDocuments(isAgent: boolean) {
    const commands = isAgent
      ? ["/user", "myaccount", "agent", "documents", "Verified"]
      : ["/user", "myaccount", "documents", "Verified"];
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate(commands);
    });
  }
}
