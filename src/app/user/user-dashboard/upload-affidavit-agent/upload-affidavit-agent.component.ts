import { HttpClient } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { UserAffidavitSaveRequest } from "src/app/shared/models/UserAffidavitSaveRequest";
import { environment } from "src/environments/environment";
import { Court } from "../../user-models/Court";
import { Deponent } from "../../user-models/Deponent";
import { UserdataService } from "../../userservices/userdata.service";
import { TemplateFinalViewComponent } from "../../template-final-view/template-final-view.component";
import { PriceSelectionDialogComponent } from "../../price-selection-dialog/price-selection-dialog.component";
import { AffidavitRecreationService } from "src/app/services/affidavit-recreation.service";
import { isRecreationContext } from "src/app/shared/utils/recreation.util";

declare var mammoth: any;

@Component({
  selector: "app-upload-affidavit-agent",
  templateUrl: "./upload-affidavit-agent.component.html",
  styleUrls: ["./upload-affidavit-agent.component.css"],
})
export class UploadAffidavitAgentComponent implements OnInit {
  urls: string = environment.url + "user/template/";
  courts: Court[] = [];
  uploadAffidavitAgentForm: FormGroup;
  errorflag: boolean = false;
  errormessage: string = "";
  successflag = false;
  successmessage = "";
  selectedCourt;
  selectedFile: File;
  fileToConvert: File;
  deponent = new Deponent();
  templatePrice;
  templateFastTrackPrice;
  message;
  recreationContext;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: Router,
    public dialogRef: MatDialogRef<UploadAffidavitAgentComponent>,
    private activatedRoute: ActivatedRoute,
    private userDataService: UserdataService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private affidavitRecreationService: AffidavitRecreationService
  ) {}

  ngOnInit() {
    this.recreationContext = this.data && this.data.recreationContext;
    this.templatePrice = this.data.templatePrice;
    this.templateFastTrackPrice = this.data.templateFastTrackPrice;
    this.uploadAffidavitAgentForm = new FormGroup({
      firstname: new FormControl("", [Validators.required]),
      lastname: new FormControl("", [Validators.required]),
      email: new FormControl("", [
        Validators.pattern(
          "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
        ),
      ]),
      mobile: new FormControl("", [this.mobileNumberValidator()]),
      file: new FormControl("", [Validators.required]),
      court: new FormControl("", [Validators.required]),
    });
    this.getCourts();
  }

  getAllCourt(): Observable<Court[]> {
    return this.http.get<Court[]>(this.urls + "getAllCourtsByTemplate");
  }

  getCourts() {
    this.getAllCourt().subscribe(
      (response: any) => {
        if (response.success) {
          for (const responseData of response.data) {
            const court = new Court();
            court.courtId = responseData.courtId;
            court.courtName = responseData.courtName;
            this.courts.push(court);
          }
          if (this.courts.length > 0) {
            const courtId = this.isRecreationMode() && this.recreationContext.courtId
              ? this.recreationContext.courtId
              : this.courts[0].courtId;
            this.uploadAffidavitAgentForm
              .get("court")
              .setValue(courtId);
          }
        }
      },
      () => {
        
      }
    );
  }

  onFileSelected(event: any): void {
    this.errorflag = false;
    this.selectedFile = event.target.files[0];
    const MAX_FILE_SIZE_KB = 5000;
    const size = this.selectedFile.size / 1024;
    if (size > MAX_FILE_SIZE_KB) {
      this.showErrorMessage(
        `${this.selectedFile.name} file size exceeds maximum limit. Maximum allowed file size is 5MB`
      );
      return;
    }
    const maxChars = 50;
    let fileName = this.selectedFile
      ? this.selectedFile.name
      : "No file chosen";
    const trimmedFileName =
      fileName.length > maxChars
        ? fileName.substring(0, maxChars) + "..."
        : fileName; // trim the text if it's too long
    const fileInput = event.target.nextElementSibling;
    fileInput.value = fileName;
    this.selectedFile = { ...this.selectedFile, name: trimmedFileName }; // update the selectedFile property with the trimmed text
    this.fileToConvert = event.target.files[0];
  }

  mobileNumberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const mobileNumber = control.value;
      const validFormat = /^[0-9]{11}$/; // Assuming the mobile number should have 11 digits

      if (mobileNumber && !validFormat.test(mobileNumber)) {
        return { invalidMobileNumber: true };
      }

      return null;
    };
  }

  upload(): void {
    if (this.isRecreationMode()) {
      if (!this.selectedFile) {
        this.showErrorMessage(
          "No file selected. Please select a file in either .docx or .pdf format."
        );
        return;
      }
      if (this.uploadAffidavitAgentForm.get("court").invalid) {
        this.showErrorMessage("Enter all mandatory fields.");
        return;
      }
      this.processSelectedFile(this.recreationContext.isExpress === true);
      return;
    }
    const firstNameControl =
      this.uploadAffidavitAgentForm.controls["firstname"];
    const lastNameControl = this.uploadAffidavitAgentForm.controls["lastname"];

    if (!this.uploadAffidavitAgentForm.valid) {
      if (
        firstNameControl.invalid ||
        firstNameControl.value.trim().length === 0
      ) {
        this.showErrorMessage("Please enter a valid first name.");
        return;
      } else if (
        lastNameControl.invalid ||
        lastNameControl.value.trim().length === 0
      ) {
        this.showErrorMessage("Please enter a valid last name.");
        return;
      } else if (this.uploadAffidavitAgentForm.get("email").invalid) {
        this.showErrorMessage("Please enter a valid email.");
        return;
      } else if (
        this.uploadAffidavitAgentForm.controls["mobile"].hasError(
          "invalidMobileNumber"
        )
      ) {
        this.showErrorMessage("Please enter a valid mobile number.");
        return;
      } else if (!this.selectedFile) {
        this.showErrorMessage(
          "No file selected. Please select a file in either .docx or .pdf format."
        );
        return;
      } else {
        this.showErrorMessage("Enter all mandatory fields.");
        return;
      }
    }
    if (this.uploadAffidavitAgentForm.valid) {
      this.openPriceSelectionDialog(this.templatePrice, this.templateFastTrackPrice)
      .afterClosed()
      .subscribe(priceData => {
        if (priceData === 'close' || !priceData) {
          return;
        }

        const isExpress = priceData.isExpress;
      this.processSelectedFile(isExpress);
    });
    }
  }

  private processSelectedFile(isExpress: boolean): void {
      if (!this.isRecreationMode()) {
        this.dialogRef.close();
      }
      this.deponent.agentId = JSON.parse(localStorage.getItem("userdata"))[
        "userId"
      ];
      this.deponent.firstName =
        this.uploadAffidavitAgentForm.value["firstname"];
      this.deponent.lastName = this.uploadAffidavitAgentForm.value["lastname"];
      this.deponent.email = this.uploadAffidavitAgentForm.value["email"];
      this.deponent.mobile = this.uploadAffidavitAgentForm.value["mobile"];
      if (this.fileToConvert) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const arrayBuffer = fileReader.result as ArrayBuffer;

          const fileType = this.fileToConvert.type;
          const fileName = this.fileToConvert.name;
          const fileExtension = fileName
            .substring(fileName.lastIndexOf(".") + 1)
            .toLowerCase();
          if (fileExtension === "docx") {
            mammoth
              .convertToHtml({ arrayBuffer: arrayBuffer })
              .then((result) => {
                let html = result.value;
                this.saveUploadAffidavit(html, fileName,isExpress);
              })
              .catch(() => {
                this.showErrorMessage("Upload failed.");
              });
          } else if (fileExtension === "pdf") {
            const reader = new FileReader();
            reader.onload = (e) => {
              const pdfData = reader.result as string;
              this.saveUploadAffidavit(null, fileName,isExpress);
            };
            reader.readAsDataURL(this.fileToConvert);
          } else {
            this.showErrorMessage(
              `Invalid file extension: ${fileExtension},only .docx file format are supported.`
            );
          }
        };
        fileReader.readAsArrayBuffer(this.fileToConvert);
      }
  }

  keyPressEvent(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  saveUploadAffidavit(html: string | null, fileName: string,isExpress: boolean) {
    if (this.isRecreationMode()) {
      this.selectedCourt = this.uploadAffidavitAgentForm.get("court").value;
      const formData = new FormData();
      if (html == null) {
        formData.append("file", this.fileToConvert);
      }
      const recreationRequest = {
        sourceAffidavitId: this.recreationContext.sourceAffidavitId,
        htmlValue: html == null ? null : JSON.stringify(html),
        userAffidavitCustomName: fileName,
        courtId: this.selectedCourt
      };
      formData.append("userAffidavit", JSON.stringify(recreationRequest));
      this.affidavitRecreationService.submitUploadRecreation(formData).subscribe(errorMessage => {
        if (errorMessage) {
          this.showErrorMessage(errorMessage);
          return;
        }
        this.dialogRef.close();
        this.affidavitRecreationService.navigateToVerifiedDocuments(true);
      });
      return;
    }
    this.userDataService.saveADeponentData(this.deponent).subscribe(
      (reponse: any) => {
        if (reponse.success) {
          this.deponent = reponse.data;
          this.selectedCourt = this.uploadAffidavitAgentForm.get("court").value;
          const userAffidavit = new UserAffidavitSaveRequest();
          userAffidavit.userAffidavitId = 0;
          userAffidavit.userId = JSON.parse(localStorage.getItem("userdata"))[
            "userId"
          ];
          userAffidavit.htmlValue = JSON.stringify(html);
          userAffidavit.status = "Pending";
          userAffidavit.isUploaded = true;
          userAffidavit.userAffidavitCustomName = fileName;
          userAffidavit.courtId = this.selectedCourt;
          userAffidavit.deponentId = this.deponent.deponentId;
          userAffidavit.isExpress = isExpress;
          const formData = new FormData();
          if (html == null) {
            formData.append("file", this.fileToConvert);
          }
          formData.append("userAffidavit", JSON.stringify(userAffidavit));
          this.http
            .post(this.urls + "saveAffidavitForUpload", formData)
            .subscribe(
              (response: any) => {
                const userAffidavitData = response.data;
                if (userAffidavitData != null) {
                  this.dialogRef.close();
                  this.openFinalPreview(
                    JSON.parse(userAffidavit.htmlValue),
                    userAffidavitData.userAffidavitId,
                    false,
                    userAffidavitData.pdfData,userAffidavitData.isExpress
                  );
                }
              },
              () => {
                this.showErrorMessage("Upload failed.");
              }
            );
        } else {
          this.showErrorMessage("Something went wrong!");
        }
      },
      () => {
        this.showErrorMessage("Something went wrong!");
      }
    );
  }

  showErrorMessage(message) {
    this.errorflag = true;
    this.successflag = false;
    this.errormessage = "*" + message;
  }

  openFinalPreview(templateValue, useraffidavitIdtemp, previewFlag, pdfData,isExpress) {
    const tempprice = isExpress ? this.templateFastTrackPrice : this.templatePrice;

    const dialogRef = this.dialog.open(TemplateFinalViewComponent, {
      data: {
        templatevalue: templateValue,
        previewflag: previewFlag,
        useraffidavitId: useraffidavitIdtemp,
        price: tempprice,
        pdfData:pdfData,
        isExpress:isExpress
      },
    });

    dialogRef.afterClosed().subscribe((data: string) => {
      const savedMessage = localStorage.getItem("message");
      if (data === undefined || savedMessage === null) {
        this.message = "Paid";
      }
      if (savedMessage === "Verified") {
        this.message = "Verified";
      }
      if (data === "Yes") {
        this.message = "Pending";
      }
      this.dialogRef.close();
      this.route.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.route.navigate([
          "/user",
          "myaccount",
          "agent",
          "documents",
          this.message,
        ]);
      });
    });

    return dialogRef;
  }

  openPriceSelectionDialog(templatePrice: number, fastTrackPrice: number): MatDialogRef<PriceSelectionDialogComponent> {
    return this.dialog.open(PriceSelectionDialogComponent, {
      panelClass: 'price-dialog-container',
      data: {
        templatePrice: templatePrice,
        fastTrackPrice: fastTrackPrice
      }
    });
  }

  private isRecreationMode(): boolean {
    return isRecreationContext(this.recreationContext);
  }
}
