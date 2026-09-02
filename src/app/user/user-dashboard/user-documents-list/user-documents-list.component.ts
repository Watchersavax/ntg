import { Component, OnInit } from "@angular/core";
import { UserdataService } from "../../userservices/userdata.service";
import { UserAffidavit } from "../../user-models/UserAffidavit";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { TemplateFinalViewComponent } from "../../template-final-view/template-final-view.component";
import { UserAffidavitSaveRequest } from "src/app/shared/models/UserAffidavitSaveRequest";
import { AlertdialogComponent } from "src/app/shared/alertdialog/alertdialog.component";
import { PageParam } from "src/app/shared/models/PageParam";
import { LoadingscreenService } from "src/app/services/loadingscreen.service";
import { NinValidationDialogComponent } from "../../nin-validation-dialog/nin-validation-dialog.component";
import { Subscription } from "rxjs";
import { CalendlyAppointmentDialogComponent } from "../../calendly-appointment-dialog/calendly-appointment-dialog.component";
import { HttpClient } from "@angular/common/http";
import { PdfService } from "src/app/services/pdf.service";
import { downloadBlob } from "src/app/shared/utils/download-blob.util";
import { SigningDocumentService } from "src/app/services/signing-document.service";
import { SigningDialogService } from "src/app/services/signing-dialog.service";
import { RejectReasonDialogService } from "src/app/services/reject-reason-dialog.service";
import { resolveSigningStatus } from "src/app/shared/utils/signing-status.util";
import { readUserData } from "src/app/shared/utils/userdata-storage.util";
import { resolveDialogStatus } from "src/app/shared/utils/dialog-result.util";
import { sortDocumentsByRejectedAt } from "src/app/shared/utils/rejected-document-sort.util";
import { UserAppointmentJoinService } from "../user-appointment-join.service";
import { UserDocumentActionsService } from "../user-document-actions.service";
import { TemplateHtmlSanitizerService } from "src/app/shared/security/template-html-sanitizer.service";

@Component({
  selector: "app-user-documents-list",
  templateUrl: "./user-documents-list.component.html",
  styleUrls: ["./user-documents-list.component.css"],
})
export class UserDocumentsListComponent implements OnInit {
  pageParam = new PageParam();
  documentList: UserAffidavit[] = [];
  filteredList: UserAffidavit[] = [];
  affidavitId: number;
  searchKeyword: string;
  affidavitName: string;
  dataMessage: string;
  PAGE_SIZE = 10;
  userId;
  prevflag = true;
  nextflag = false;
  status;

  MAP = {
    Pending: {
      status: "Pending",
      registrarStatus: "Pending",
      finalStatus: "Pending",
    },
    Paid: {
      status: "Paid",
      registrarStatus: "Pending",
      finalStatus: "Paid",
    },
    Verified: {
      status: "Verified",
      registrarStatus: "Pending",
      finalStatus: "Verified",
    },
    Scheduled: {
      status: "Verified",
      registrarStatus: "Scheduled",
      finalStatus: "Scheduled",
    },
    Approved: {
      status: "Verified",
      registrarStatus: "Approved",
      finalStatus: "Approved",
    },
    Rejected: {
      status: "Verified",
      registrarStatus: "Rejected",
      finalStatus: "Rejected",
    },
  };
  activeStatusTab = this.MAP.Pending;
  private userSubscription: Subscription;
  private signingRefreshTimers: any[] = [];
  private pendingRejectedDocuments: { [affidavitId: number]: UserAffidavit } = {};
  shouldOpenPriceDialog: boolean = true;
  
  constructor(
    private loadingservice: LoadingscreenService,
    private dialog: MatDialog,
    private userDataService: UserdataService,
    private route: Router,
    private activatedRoute: ActivatedRoute, public http: HttpClient, private pdfService: PdfService,
    private signingDocumentService: SigningDocumentService,
    private signingDialogService: SigningDialogService,
    private rejectReasonDialog: RejectReasonDialogService,
    private userAppointmentJoinService: UserAppointmentJoinService,
    private userDocumentActionsService: UserDocumentActionsService,
    private templateHtmlSanitizer: TemplateHtmlSanitizerService
  ) {
    if (this.activatedRoute.snapshot.queryParams["resp"]) {
      this.route.navigate(["/user", "myaccount", "documents"]);
    }
  }

  ngOnInit() {
    const user = readUserData();
    this.userId = user.userId;
    let isAgent = user.isAgent;
    if (isAgent) {
      this.route.navigate(["/user", "myaccount", "agent", "documents"]);
    }
    this.subscribeToParamsChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromParamsChanges();
    this.clearSigningRefreshTimers();
  }

  private subscribeToParamsChanges(): void {
    this.userSubscription = this.activatedRoute.params.subscribe(
      (params: Params) => {
        let status = localStorage.getItem("message");

        if (!status) {
          status = params["status"];
        }

        if (status !== undefined) {
          this.status = status;
          this.onStatusChange(this.status);
        } else {
          this.onStatusChange("Pending");
        }
      }
    );
  }

  private unsubscribeFromParamsChanges(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  fetchAffidavitList() {
    this.documentList = [];
    this.pageParam.reset();
    this.nextflag = false;
    this.prevflag = true;

    this.userDataService
      .fetchAllUserAffidavitByStatus(
        this.userId,
        this.activeStatusTab.status,
        this.activeStatusTab.registrarStatus
      )
      .subscribe(
        (response: any) => {
          if (response.success) {
            for (const responseData of response.data) {
              const document = new UserAffidavit();
              document.status = responseData.status;
              document.templateName = responseData.templateName;
              document.userAffidavitId = responseData.userAffidavitId;
              document.userid = responseData.userId;
              document.templateVersionId = responseData.templateVersionId;
              document.isExpress = responseData.isExpress;
              document.templatePrice = responseData.price;
              document.templateFastTrackPrice =  responseData.templateFastTrackPrice;
              if(document.isExpress){
                document.price = responseData.templateFastTrackPrice;
              }else{
                document.price = responseData.price;
              }
              document.userAffidavitCustomName =
                responseData.userAffidavitCustomName;
              document.registrarStatus = responseData.registrarStatus;
              document.registrarId = responseData.registrarId;
              document.registrarName = responseData.registrarName;
              document.registrarCourtName = responseData.registrarCourtName;
              document.signatureStatus = responseData.signatureStatus;
              document.registrarComments = responseData.registrarComments;
              document.signatureRejectedAt = responseData.signatureRejectedAt;
              document.signatureRejectedByRole = responseData.signatureRejectedByRole;
              document.signatureUserSignedAt = responseData.signatureUserSignedAt;
              document.disablePreviewFlag = false;
              document.isUploaded = responseData.isUploaded;
              document.isCaseRelated = responseData.isCaseRelated;
              document.appointmentId = responseData.appointmentId;
              document.attendeeId = responseData.attendeeId;
              document.appointmentJoinUrl = responseData.appointmentJoinUrl;
              document.appointmentCancelled = responseData.appointmentCancelled;
              document.appointmentCompleted = responseData.appointmentCompleted;
              document.canRecreate = responseData.canRecreate;
              document.recreateUntil = responseData.recreateUntil;
              document.creationMethod = responseData.creationMethod;
              let meetingTiming=responseData.meetingTiming;
              document.meetingTiming = meetingTiming;
              document.meetingEndTiming = responseData.meetingEndTiming;
              document.canCancelAppointment = this.canCancelScheduledAppointment(meetingTiming);
              document.missedAppointment = responseData.missedAppointment === true;
              this.documentList.push(document);
            }
            this.mergePendingRejectedDocuments();
            this.paginateData("");
          }
        },
        () => {
          
        }
      );
  }

  disablePaginator(move) {
    if (move == "forward") {
      this.nextflag = true;
      this.prevflag = false;
    } else if (move == "backward") {
      this.prevflag = true;
      this.nextflag = false;
    }
  }

  editAffidavit(document: UserAffidavit) {
    if (document.templateName == null || document.templateName == undefined) {
      document.templateName = "";
    }
    if (!document.userAffidavitCustomName) {
      document.userAffidavitCustomName = "";
    }

    this.route.navigate([
      "/user",
      "edittemplate",
      document.userAffidavitId,
      document.templateVersionId,
      document.price,
      document.templateName,
      document.userAffidavitCustomName,
    ]);
  }

  deleteUserAffidavit(index: number, document: UserAffidavit) {
    if (!!document) {
      const confirmationMessage =
        "Do you want to delete affidavit " +
        document.userAffidavitCustomName +
        "?";
      this.dialog
        .open(AlertdialogComponent, {
          data: {
            actionname: "Delete Affidavit",
            message: confirmationMessage,
            onlyclose: false,
          },
        })
        .afterClosed()
        .subscribe((data) => {
          if (data === "Yes") {
            this.userDataService
              .deleteUserAffidavitById(document.userAffidavitId)
              .subscribe(
                (response: any) => {
                  if (response.success) {
                    this.documentList = this.documentList.filter(
                      (affidavit) => {
                        return affidavit.userAffidavitId !== response.data;
                      }
                    );
                    this.filteredList = this.filteredList.filter(
                      (affidavit) => {
                        return affidavit.userAffidavitId !== response.data;
                      }
                    );
                  }
                },
                () => {
                  
                }
              );
          }
        });
    }
  }

  openFinalPriview(document: any) {
    document.disablePreviewFlag = true;
  
    this.userDataService
      .fetchUserAffidavitData(document.userAffidavitId)
      .subscribe((data) => {
        let requestobj: UserAffidavitSaveRequest = data["data"];
        document.disablePreviewFlag = false;
        const htmlValue = this.templateHtmlSanitizer.sanitize(JSON.parse(requestobj.htmlValue));
        const pdfFileName = `${document.userAffidavitCustomName}.pdf`;
        this.pdfService
        .previewPdf(htmlValue, pdfFileName)
          .then((docUrl) => {
            const dialogref = this.dialog.open(TemplateFinalViewComponent, {
              data: {
                templatevalue: htmlValue,
                previewflag: true,
                registerStatus: data["data"]["registrarStatus"],
                useraffidavitId: document.userAffidavitId,
                pdfData: requestobj.pdfData,
                docUrl: docUrl,
                fileName: pdfFileName
              }
            });
            return dialogref;
          })
          .catch((error) => {
            console.error("Error generating PDF preview:", error);
          });
      });
  }

  makePayment(document: UserAffidavit) {
    if (
      document.userAffidavitCustomName == undefined ||
      document.userAffidavitCustomName.length == 0
    ) {
      this.affidavitName = document.templateName;
    } else {
      this.affidavitName = document.userAffidavitCustomName;
    }
    this.route.navigate(["/user", "makePayment"], {
      queryParams: {
        p: document.price,
        id: document.userAffidavitId,
        name: this.affidavitName,
      },
    });
  }

  filterList() {
    this.filteredList = this.documentList.filter(
      (option) =>
        option.templateName
          .toLowerCase()
          .includes(this.emptyIfNull(this.searchKeyword).toLowerCase()) ||
        this.emptyIfNull(option.userAffidavitCustomName)
          .toLowerCase()
          .includes(this.searchKeyword.toLowerCase()) ||
        option.status.toLowerCase().includes(this.searchKeyword.toLowerCase())
    );
    if (this.activeStatusTab && this.activeStatusTab.registrarStatus === "Rejected") {
      this.filteredList = sortDocumentsByRejectedAt(this.filteredList);
    }
  }

  onStatusChange(statusTab: string) {
    this.activeStatusTab = this.MAP[statusTab];
    this.fetchAffidavitList();
  }

  /**
   * @param o: string
   * @return Empty String If null or undefined is passed
   */
  emptyIfNull(o: string) {
    return o === null || o === undefined ? "" : o;
  }

  nextPage() {
    this.pageParam.page++;
    const nextData = this.paginateData("");
    this.disablePaginator("forward");
    if (!nextData || nextData.length === 0) {
      this.pageParam.page--;
      this.paginateData("");
    }
  }

  previousPage() {
    this.nextflag = false;

    if (this.pageParam.page > 0) {
      this.pageParam.page--;
      if (this.pageParam.page == 0) {
        this.prevflag = true;
      }
      this.paginateData("");
    } else {
      this.prevflag = true;
    }
  }

  paginateData(move) {
    this.filterList();
    const offset = this.pageParam.page * this.PAGE_SIZE;
    this.filteredList = this.filteredList.slice(
      offset,
      offset + this.PAGE_SIZE
    );

    if (this.filteredList.length == 0) {
      this.disablePaginator(move);
    }

    setTimeout(() => {
      for (let i = 0; i < this.filteredList.length; i++) {
        const currentItem = this.filteredList[i];
        this.userDataService
          .fetchUserAffidavitData(this.filteredList[i].userAffidavitId)
          .subscribe((innerResponse: any) => {
            let requestObj: UserAffidavitSaveRequest = innerResponse.data;
            let node = document.createElement("div");
            this.templateHtmlSanitizer.replaceContent(node, JSON.parse(requestObj.htmlValue));
            node.style.width = "200.63px";
            node.style.height = "200.63px";
            node.style.display = "flex";
            node.style.flexFlow = "row wrap";
            node.style.fontSize = "8px";
            node.style.border = "0px";

            let spanList = node.getElementsByTagName("span");
            for (let i = 0; i < spanList.length; i++) {
              spanList[i].style.fontSize = "8px";
            }
            let divList = node.getElementsByTagName("div");
            for (let i = 0; i < divList.length; i++) {
              divList[i].style.border = "0px";
            }

            //   `rw-${this.filteredList[i].userAffidavitId}-cell`
            //   /row-cell/g,
            // "a sd a".replace(/a/g, 'b')
            let htmlstring = node.innerHTML;
            if (htmlstring) {
              htmlstring = htmlstring.replace(/row-cell/g, `rw-${currentItem.userAffidavitId}-cell`);
              if (this.filteredList[i]) {
                this.filteredList[i].htmlValue = htmlstring;
              } 
            }

          });
      }
    }, 0);

    return this.filteredList;
  }

  search() {
    this.pageParam.reset();
    this.paginateData("");
  }

  eventTriggeredFromPaymentChild() {
    this.fetchAffidavitList();
  }

  downloadDocument(documentObj) {
    documentObj.disablePreviewFlag = true;
    this.signingDocumentService.downloadSignedDocument(documentObj.userAffidavitId)
      .subscribe((blob) => {
        const filename =
          documentObj.userAffidavitCustomName != null
            ? documentObj.userAffidavitCustomName
            : documentObj.templateName;
        downloadBlob(blob, filename);
      }, (error) => {
        console.error("Error downloading the file:", error);
      });
  }

  verifyNINSign(documentObj) {
    const dialogRef: MatDialogRef<NinValidationDialogComponent> =
      this.dialog.open(NinValidationDialogComponent, {
        disableClose: true,
        panelClass: 'nin-validation-dialog-container',
        data: { affidavitId: documentObj.userAffidavitId,isExpress: documentObj.isExpress },
      });

    dialogRef.afterClosed().subscribe((data: string) => {
      if (data === "Verified") {
        this.route.navigate(["/user", "myaccount", "documents", data]);
      } else {
        this.route.navigate(["/user", "myaccount", "documents", data]);
      }
    });
  }

  showRejectReason(documentObj) {
    const rejectedBy =
      documentObj.signatureRejectedByRole === "USER" ? "You" : documentObj.registrarName;
    this.rejectReasonDialog.open(documentObj.registrarComments, documentObj.signatureRejectedAt,
      rejectedBy);
  }

  sendToSign(documentObj) {
    documentObj.disableSendToSign = true;
    this.loadingservice.startLoading();
    this.signingDocumentService
      .createSigningDocument({ affidavitId: documentObj.userAffidavitId })
      .then(() => {
        this.fetchAffidavitList();
      })
      .catch((error) => {
        this.dialog.open(AlertdialogComponent, {
          data: {
            actionname: "Send to Sign",
            message:
              error && error.message
                ? error.message
                : "Unable to send document for signing.",
            onlyclose: true,
          },
        });
      })
      .finally(() => {
        documentObj.disableSendToSign = false;
        this.loadingservice.stopLoading();
      });
  }

  signDocument(documentObj) {
    this.openUserSigningDialogForDocument(documentObj);
  }

  canJoinMeeting(documentObj): boolean {
    return this.userDocumentActionsService.canJoinMeeting(documentObj);
  }

  joinMeeting(documentObj) {
    if (!this.canJoinMeeting(documentObj)) {
      return;
    }

    this.loadingservice.startLoading();
    this.userDataService.fetchUserAffidavitData(documentObj.userAffidavitId).subscribe((response: any) => {
      this.loadingservice.stopLoading();
      const userAffidavitObj = response && response.data ? response.data : documentObj;
      userAffidavitObj.useraffidavitId = userAffidavitObj.userAffidavitId || documentObj.userAffidavitId;
      userAffidavitObj.templateName = userAffidavitObj.templateName || documentObj.templateName;
      userAffidavitObj.userAffidavitCustomName =
        userAffidavitObj.userAffidavitCustomName || documentObj.userAffidavitCustomName;
      userAffidavitObj.price = userAffidavitObj.price || documentObj.price;

      this.userAppointmentJoinService.openVideoDialog({
        userAffidavitObj: userAffidavitObj,
        meetingId: documentObj.appointmentId,
        meetingTiming: this.userAppointmentJoinService.formatMeetingTiming(documentObj.meetingTiming),
        meetingEndTiming: documentObj.meetingEndTiming,
        meetingUrl: documentObj.appointmentJoinUrl,
        attendeeId: documentObj.attendeeId,
        afterCompleted: () => this.fetchAffidavitList(),
      });
    }, () => {
      this.loadingservice.stopLoading();
    });
  }

  private openUserSigningDialogForDocument(documentObj, afterClosed?: () => void) {
    const user = readUserData();
    this.signingDialogService
      .openUserSigning({
        affidavitId: documentObj.userAffidavitId,
        dialog: this.dialog,
        name: user && user.displayName,
        email: user && user.email,
        allowDocumentRejection: true,
        openErrorMessage: "Unable to open document for signing.",
        onSignedOrRejected: (result) => this.handleSignedOrRejected(documentObj, result),
        onClosed: afterClosed,
      })
      .catch(() => {
        // SigningDialogService already shows the user-facing error.
      });
  }

  scheduleDocument(documentObj,activeTab) {
    const user = readUserData();
    const dialogRef: MatDialogRef<CalendlyAppointmentDialogComponent> =
      this.dialog.open(CalendlyAppointmentDialogComponent, {
        disableClose: true,
        panelClass: 'calendly-dialog-container',
        data: { activeTab: activeTab}
      });
    dialogRef.componentInstance.affidavitId = documentObj.userAffidavitId;
    dialogRef.componentInstance.name = user.displayName;
    dialogRef.componentInstance.email = user.email;
    dialogRef.componentInstance.isExpress = documentObj.isExpress;
    dialogRef.afterClosed().subscribe((data: any) => {
      const status = resolveDialogStatus(data);
      if (status === "SchedulingFailed") {
        this.showSchedulingFailure(data);
        return;
      }
      if (status === "Scheduled" && this.canSignDocument(documentObj)) {
        this.openUserSigningDialogForDocument(documentObj);
      }
      localStorage.setItem("message", status);
      this.route.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.route.navigate(["/user", "myaccount", "documents",status]);
      });
    });

  }

  cancelScheduledAppointment(documentObj) {
    this.dialog.open(AlertdialogComponent, {
      data: {
        actionname: "Cancel Meeting",
        message: "Are you sure you want to cancel this meeting? Once it is cancelled, you can book a new call whenever you are ready.",
        onlyclose: false
      }
    }).afterClosed().subscribe((data) => {
      if (data !== "Yes") {
        return;
      }
      this.userDataService.cancelScheduledAppointment(documentObj.userAffidavitId)
        .subscribe((response: any) => {
          if (response && response.schedulingStatus === "Problem") {
            this.showSchedulingFailure(response, "Cancel Meeting", "Meeting could not be cancelled.");
            return;
          }
          const navigateAfterCancel = () => {
            localStorage.setItem("message", "Verified");
            this.route.navigateByUrl("/", { skipLocationChange: true }).then(() => {
              this.route.navigate(["/user", "myaccount", "documents", "Verified"]);
            });
          };
          if (response && response.schedulingMessage) {
            this.dialog.open(AlertdialogComponent, {
              data: {
                actionname: "Cancel Meeting",
                message: response.schedulingMessage,
                onlyclose: true,
              },
            }).afterClosed().subscribe(() => navigateAfterCancel());
            return;
          }
          navigateAfterCancel();
        }, (error) => {
          this.showSchedulingFailure(error && error.error ? error.error : error, "Cancel Meeting",
            "Meeting could not be cancelled.");
        });
    });
  }

  private canCancelScheduledAppointment(meetingTiming: any): boolean {
    return this.userDocumentActionsService.canCancelScheduledAppointment(meetingTiming);
  }

  private showSchedulingFailure(result: any, actionName: string = "Schedule Appointment",
    fallbackMessage: string = "Meeting could not be scheduled.") {
    this.dialog.open(AlertdialogComponent, {
      data: {
        actionname: actionName,
        message: (result && result.schedulingMessage) || fallbackMessage,
        onlyclose: true,
      },
    });
  }

  canSignDocument(documentObj): boolean {
    return this.userDocumentActionsService.canSignDocument(documentObj);
  }

  canSendToSignDocument(documentObj): boolean {
    return this.userDocumentActionsService.canSendToSignDocument(documentObj);
  }

  canRecreateDocument(documentObj): boolean {
    return this.userDocumentActionsService.canRecreateDocument(documentObj);
  }

  recreateDocument(documentObj): void {
    this.userDocumentActionsService.recreateDocument(documentObj, false);
  }

  private refreshSigningState(documentObj) {
    if (!documentObj || !documentObj.userAffidavitId) {
      return;
    }
    this.signingDocumentService
      .getSigningStatus(documentObj.userAffidavitId)
      .then((data) => {
        if (!data) {
          return;
        }
        documentObj.signatureStatus = resolveSigningStatus(data, documentObj.signatureStatus);
        if (data.userSigned) {
          documentObj.signatureUserSignedAt = documentObj.signatureUserSignedAt || new Date().toISOString();
        }
        if (data.rejected) {
          documentObj.signatureRejectedAt = documentObj.signatureRejectedAt || new Date().toISOString();
        }
      })
      .catch((error) => {
        console.warn("Unable to refresh signing state:", error);
      });
  }

  private handleSignedOrRejected(documentObj, result: any) {
    const rejected = result && result.status === "Rejected";
    if (rejected) {
      documentObj.registrarStatus = "Rejected";
      documentObj.signatureStatus = "REJECTED";
      documentObj.signatureRejectedAt = documentObj.signatureRejectedAt || new Date().toISOString();
      documentObj.signatureRejectedByRole = documentObj.signatureRejectedByRole || "USER";
      documentObj.registrarComments = result.reason || documentObj.registrarComments;
      documentObj.canRecreate = false;
      this.rememberPendingRejectedDocument(documentObj);
    } else {
      documentObj.signatureUserSignedAt = documentObj.signatureUserSignedAt || new Date().toISOString();
    }
    this.refreshSigningState(documentObj);
    this.scheduleSigningRefresh(rejected ? "Rejected" : undefined);
  }

  private scheduleSigningRefresh(statusTab?: string) {
    this.clearSigningRefreshTimers();
    [0, 1500, 4000, 8000, 12000, 20000].forEach((delay) => {
      const timer = setTimeout(() => {
        if (statusTab && this.activeStatusTab.finalStatus !== statusTab) {
          this.onStatusChange(statusTab);
          return;
        }
        this.fetchAffidavitList();
      }, delay);
      this.signingRefreshTimers.push(timer);
    });
  }

  private clearSigningRefreshTimers() {
    this.signingRefreshTimers.forEach((timer) => clearTimeout(timer));
    this.signingRefreshTimers = [];
  }

  private rememberPendingRejectedDocument(documentObj: UserAffidavit) {
    if (!documentObj || !documentObj.userAffidavitId) {
      return;
    }
    this.pendingRejectedDocuments[documentObj.userAffidavitId] = documentObj;
  }

  private mergePendingRejectedDocuments() {
    if (!this.activeStatusTab || this.activeStatusTab.registrarStatus !== "Rejected") {
      return;
    }
    Object.keys(this.pendingRejectedDocuments).forEach((key) => {
      const affidavitId = Number(key);
      const existsInBackendList = this.documentList.some((document) => document.userAffidavitId === affidavitId);
      if (existsInBackendList) {
        delete this.pendingRejectedDocuments[affidavitId];
        return;
      }
      this.documentList.push(this.pendingRejectedDocuments[affidavitId]);
    });
  }

}