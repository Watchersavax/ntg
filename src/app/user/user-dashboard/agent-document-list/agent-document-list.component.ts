import { Component, OnInit } from "@angular/core";
import { PageParam } from "src/app/shared/models/PageParam";
import { UserAffidavit } from "../../user-models/UserAffidavit";
import { MatDialog, MatDialogRef } from "@angular/material";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { UserdataService } from "../../userservices/userdata.service";
import { UserAffidavitSaveRequest } from "src/app/shared/models/UserAffidavitSaveRequest";
import { TemplateFinalViewComponent } from "../../template-final-view/template-final-view.component";
import { AlertdialogComponent } from "src/app/shared/alertdialog/alertdialog.component";
import { AgentAffidavit } from "../../user-models/AgentAffidavit";
import { NinValidationDialogComponent } from "../../nin-validation-dialog/nin-validation-dialog.component";
import { Subscription } from "rxjs";
import { CalendlyAppointmentDialogComponent } from "../../calendly-appointment-dialog/calendly-appointment-dialog.component";
import * as moment from 'moment';
import { PdfService } from "src/app/services/pdf.service";
import { downloadBlob } from "src/app/shared/utils/download-blob.util";
import { SigningDocumentService } from "src/app/services/signing-document.service";
import { RejectReasonDialogService } from "src/app/services/reject-reason-dialog.service";
import { canSendToSign } from "src/app/shared/utils/signing-status.util";
import { resolveDialogStatus } from "src/app/shared/utils/dialog-result.util";
import { readUserData } from "src/app/shared/utils/userdata-storage.util";
import { sortDocumentsByRejectedAt } from "src/app/shared/utils/rejected-document-sort.util";
import { UserDocumentActionsService } from "../user-document-actions.service";
import { TemplateHtmlSanitizerService } from "src/app/shared/security/template-html-sanitizer.service";

@Component({
  selector: "app-agent-document-list",
  templateUrl: "./agent-document-list.component.html",
  styleUrls: ["./agent-document-list.component.css"],
})
export class AgentDocumentListComponent implements OnInit {
  pageParam = new PageParam();
  documentList: AgentAffidavit[] = [];
  filteredList: AgentAffidavit[] = [];
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
  shouldOpenPriceDialog: boolean = true;
  activeStatusTab = this.MAP.Pending;
  private userSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private userDataService: UserdataService,
    private route: Router,
    private activatedRoute: ActivatedRoute,private pdfService: PdfService,
    private signingDocumentService: SigningDocumentService,
    private rejectReasonDialog: RejectReasonDialogService,
    private userDocumentActionsService: UserDocumentActionsService,
    private templateHtmlSanitizer: TemplateHtmlSanitizerService
  ) {
    if (this.activatedRoute.snapshot.queryParams["resp"]) {
      this.route.navigate(["/user", "myaccount", "agent", "documents"]);
    }
  }

  ngOnInit() {
    const userData = readUserData();
    this.userId = userData.userId;
    let isAgent = userData.isAgent;
    if (!isAgent) {
      this.route.navigate(["/user", "myaccount", "documents"]);
    }
    this.subscribeToParamsChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromParamsChanges();
  }

  private subscribeToParamsChanges(): void {
    this.userSubscription = this.activatedRoute.params.subscribe(
      (params: Params) => {
        const status = params["status"];

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

  search() {
    this.pageParam.reset();
    this.paginateData("");
  }
  onStatusChange(statusTab: string) {
    this.activeStatusTab = this.MAP[statusTab];
    this.fetchAffidavitList();
  }

  fetchAffidavitList() {
    this.documentList = [];
    this.pageParam.reset();
    this.nextflag = false;
    this.prevflag = true;

    this.userDataService
      .fetchAllAgentUserAffidavitByStatus(
        this.userId,
        this.activeStatusTab.status,
        this.activeStatusTab.registrarStatus
      )
      .subscribe(
        (response: any) => {
          if (response.success) {
            
            for (const responseData of response.data) {
              const document = new AgentAffidavit();
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
              document.deponentEmail = responseData.deponenntEmail;
              document.deponentFirstName = responseData.deponentFirstName;
              document.deponentLastName = responseData.deponentLastName;
              document.deponentMobile = responseData.deponentMobile;
              document.deponentId = responseData.deponentId;
              document.isUploaded = responseData.isUploaded;
              let meetingTiming=responseData.meetingTiming;
              document.meetingTiming = meetingTiming;
              document.meetingEndTiming = responseData.meetingEndTiming;
              document.appointmentId = responseData.appointmentId;
              document.attendeeId = responseData.attendeeId;
              document.appointmentJoinUrl = responseData.appointmentJoinUrl;
              document.appointmentCancelled = responseData.appointmentCancelled;
              document.appointmentCompleted = responseData.appointmentCompleted;
              document.canRecreate = responseData.canRecreate;
              document.recreateUntil = responseData.recreateUntil;
              document.creationMethod = responseData.creationMethod;
              document.canCancelAppointment = this.canCancelScheduledAppointment(meetingTiming);
              document.missedAppointment = responseData.missedAppointment === true;
              this.documentList.push(document);
              
            }
            this.paginateData("");
          }
        },
        () => {
          
        }
      );
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

  deleteUserAffidavit(document: UserAffidavit) {
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

            // "a sd a".replace(/a/g, 'b')
            let htmlstring = node.innerHTML;
            htmlstring = htmlstring.replace(
              /row-cell/g,
              `rw-${this.filteredList[i].userAffidavitId}-cell`
            );

            this.filteredList[i].htmlValue = htmlstring;
          });
      }
    }, 0);

    return this.filteredList;
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

  disablePaginator(move) {
    if (move == "forward") {
      this.nextflag = true;
      this.prevflag = false;
    } else if (move == "backward") {
      this.prevflag = true;
      this.nextflag = false;
    }
  }
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
        data: { 
          affidavitId: documentObj.userAffidavitId, 
          isExpress: documentObj.isExpress,
          email: documentObj.deponentEmail,
          name: documentObj.deponentFirstName + documentObj.deponentLastName
        }
      });
    dialogRef.afterClosed().subscribe((data: string) => {
      if (data === "Verified") {
        this.route.navigate(["/user", "myaccount", "agent", "documents", data]);
      } else {
        this.route.navigate(["/user", "myaccount", "agent", "documents", data]);
      }
    });
  }

  showRejectReason(documentObj) {
    let rejectedBy = documentObj.registrarName;
    if (documentObj.signatureRejectedByRole === "USER") {
      const deponentName = ((documentObj.deponentFirstName || "") + " " +
        (documentObj.deponentLastName || "")).trim();
      rejectedBy = deponentName || "Deponent";
    }
    this.rejectReasonDialog.open(documentObj.registrarComments, documentObj.signatureRejectedAt,
      rejectedBy);
  }

  sendToSign(documentObj) {
    documentObj.disableSendToSign = true;
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
      });
  }

  canSendToSignDocument(documentObj): boolean {
    return canSendToSign(documentObj);
  }

  canRecreateDocument(documentObj): boolean {
    return this.userDocumentActionsService.canRecreateDocument(documentObj);
  }

  recreateDocument(documentObj): void {
    this.userDocumentActionsService.recreateDocument(documentObj, true);
  }

  scheduleDocument(documentObj,activeTab) {
    // Agents schedule for deponents, but cannot fetch or open the deponent's user signing link.
    const dialogRef: MatDialogRef<CalendlyAppointmentDialogComponent> =
      this.dialog.open(CalendlyAppointmentDialogComponent, {
        disableClose: true,
        data: { activeTab: activeTab}
      });
    dialogRef.componentInstance.affidavitId = documentObj.userAffidavitId;
    dialogRef.componentInstance.name = `${documentObj.deponentFirstName} ${documentObj.deponentLastName}`;
    dialogRef.componentInstance.email = documentObj.deponentEmail;
    dialogRef.componentInstance.isExpress = documentObj.isExpress;
    dialogRef.afterClosed().subscribe((data: any) => {
      const status = resolveDialogStatus(data);
      if (status === "SchedulingFailed") {
        this.showSchedulingFailure(data);
        return;
      }
      this.route.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        localStorage.setItem("message", status);
        this.route.navigate(["/user", "myaccount", "agent","documents",status]);
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
              this.route.navigate(["/user", "myaccount", "agent", "documents", "Verified"]);
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
    if (!meetingTiming) {
      return false;
    }
    const date = moment(meetingTiming);
    if (!date.isValid()) {
      return false;
    }
    const minutesUntilMeeting = (date.toDate().getTime() - new Date().getTime()) / 60000;
    return minutesUntilMeeting > 10;
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

}
