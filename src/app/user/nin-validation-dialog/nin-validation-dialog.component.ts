import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { CourtDataService } from "src/app/court/courtdataservices/court-data.service";
import { NinValidation } from "../user-models/NinValidation";
import { UserdetailsService } from "../userservices/userdetails.service";
import { UserVerification } from "../user-models/UserVerification";
import { SigningDialogService } from "src/app/services/signing-dialog.service";
import { NIN_DIALOG_SIZE } from "src/app/shared/constants/dialog-size.constants";
import { resolveDialogStatus } from "src/app/shared/utils/dialog-result.util";
import { readUserData } from "src/app/shared/utils/userdata-storage.util";

@Component({
  selector: "app-nin-validation-dialog",
  templateUrl: "./nin-validation-dialog.component.html",
  styleUrls: ["./nin-validation-dialog.component.css"],
})
export class NinValidationDialogComponent implements OnInit {
  validateNIN: FormGroup;
  errorFlag = false;
  errorMessage = "";
  ninValidation = new NinValidation();
  isUploaded: Boolean;
  isCaseRelated: Boolean;
  showCalendly: boolean = false;
  message = "Paid";
  verificationTypes: UserVerification[] = [];
  userData: any;
  userType: String;

  @ViewChild("verificationtypeInput", { static: false })
  inputElement: ElementRef;

  constructor(
    private route: Router,
    public dialogRef: MatDialogRef<NinValidationDialogComponent>,
    private activatedRoute: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public userdetailsService: UserdetailsService,
    public courtDataService: CourtDataService,
    private signingDialogService: SigningDialogService,
    private fb: FormBuilder
  ) {
    this.userData = readUserData();
    if (this.userData.isAgent) {
      this.userType = "agent";
    } else if (this.userData.isCorporate) {
      this.userType = "corporate";
    } else {
      this.userType = "individual";
    }
  }

  ngOnInit() {
    this.fetchVerificationList();
    this.validateNIN = this.fb.group({
      idNumber: new FormControl("", [
        Validators.required,
        Validators.minLength(16),
        Validators.maxLength(16),
      ]),
      verificationType: ["", Validators.required],
    });

    this.validateNIN
      .get("verificationType")
      .valueChanges.subscribe((selectedVerificationType) => {
        this.errorFlag = false;
        const verificationType = this.verificationTypes.find(
          (v) => v.verificationCode === selectedVerificationType
        );
        let idNumberMaxLength = Infinity; // Default maximum length
        let idNumberMinLength = 16; // Default minimum length

        if (verificationType) {
          if (selectedVerificationType === "DL") {
            idNumberMinLength = 9;
            idNumberMaxLength = Infinity;
          } else if (selectedVerificationType === "CAC") {
            idNumberMinLength = 8;
            idNumberMaxLength = Infinity;
          } else {
            idNumberMinLength = verificationType.validationLength;
            idNumberMaxLength = verificationType.validationLength;
          }
        }
        const idNumberControl = this.validateNIN.get("idNumber");
        this.validateNIN.get("idNumber").setValue("");
        if (verificationType) {
          idNumberControl.setValidators([
            Validators.required,
            Validators.maxLength(idNumberMaxLength),
            Validators.minLength(idNumberMinLength),
          ]);
          idNumberControl.updateValueAndValidity();
          this.ninValidation.verificationType = selectedVerificationType;
        }
      });
    this.initializeFormData();
    localStorage.setItem("message", this.message);
  }
  ngAfterViewInit() {
    if (this.inputElement) {
      this.inputElement.nativeElement.addEventListener('paste', (event: ClipboardEvent) => {
        this.handlePasteEvent(event);
      });
    }
  }

  handlePasteEvent(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    const verificationType = this.validateNIN.get('verificationType').value;

   if (verificationType === 'NIN') {
    const isValid = /^[0-9]*$/.test(pastedText);
    if (!isValid) {
      event.preventDefault();
      this.validateNIN.get('idNumber').setValue('');
    }
  } else {
    const isValid = /^[a-zA-Z0-9]*$/.test(pastedText);
    if (!isValid) {
      event.preventDefault();
      this.validateNIN.get('idNumber').setValue('');
    }
   }
  }
  
  fetchVerificationList() {
    this.verificationTypes = [];
    this.userdetailsService
      .getAllVerificationTypeByAffidavitId(this.data.affidavitId,this.userType)
      .subscribe((response: any) => {
        if (response.success) {
          this.verificationTypes = response.data;
        }
      });
  }
  //     // invalid character, prevent input

  keyPressEvent(event: any) {
    this.errorFlag = false;
    const verificationType = this.validateNIN.get("verificationType").value;
    const inputChar = String.fromCharCode(event.charCode);
    if (verificationType !== "NIN" && !/^[0-9a-zA-Z]*$/.test(inputChar)) {
      event.preventDefault();
    } else if (verificationType === "NIN" && !/^[0-9]*$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  getLabelForVerificationType(verificationType: string): string {
    const selectedType = this.verificationTypes.find(
      (type) => type.verificationCode === verificationType
    );
    return selectedType
      ? "Enter Your " + selectedType.verificationName
      : "Enter Your Verification Number";
  }
  getMaxLengthForVerificationType(verificationType: string): number {
    const selectedType = this.verificationTypes.find(
      (type) => type.verificationCode === verificationType
    );
    return selectedType
      ? verificationType === "DL" || verificationType === "CAC"
        ? Infinity
        : selectedType.validationLength
      : 16;
  }

  getMinLengthForVerificationType(verificationType: string): number {
    const selectedType = this.verificationTypes.find(
      (type) => type.verificationCode === verificationType
    );
    return selectedType
      ? verificationType === "DL"
        ? 9
        : verificationType === "PASSPORT"
        ? 5
        : verificationType === "CAC"
        ? 8
        : selectedType.validationLength
      : 16;
  }

  private initializeFormData() {
    this.ninValidation.affidavitId = this.data.affidavitId;
    this.userData = this.userData || readUserData();
    this.ninValidation.isAgent = this.userData.isAgent;
    if (!this.ninValidation.isAgent) {
      this.ninValidation.firstName = this.userData.firstName;
      this.ninValidation.lastName = this.userData.lastName;
    } else {
      this.courtDataService
        .fetchDeponentByAffidavitId(this.data.affidavitId)
        .subscribe(
          (data) => {
            if (data["success"] === true) {
              const deponentData = data["data"];
              this.ninValidation.firstName = deponentData.firstName;
              this.ninValidation.lastName = deponentData.lastName;
              this.ninValidation.deponentName =
                deponentData.firstName + " " + deponentData.lastName;
              this.ninValidation.deponentEmail = deponentData.email;
              this.ninValidation.agentId = this.userData.agentId;
            }
          },
          () => {
            
          }
        );
    }
  }

  validate() {

    if (this.validateNIN.invalid) {
      this.showErrorMessage("Please provide valid information.");
      return;
    }
    this.errorFlag = false;
    this.ninValidation.idNumber = this.validateNIN.value["idNumber"];
    this.userdetailsService.ninValidationCheck(this.ninValidation).subscribe(
      (response: any) => {
        if (response.success) {
          if (response.data.statusCode === 200) {
            if (response.data.verified) {
              this.ninValidation.validateNameNin = response.data.validatedName;
              this.ninValidation.ninStatus = response.data.matchStatus;
              this.getAffidavitDetailsCreateDocument();
            } else {
              this.showErrorMessage(
                response.data.message || "Please provide valid information."
              );
            }
          } else if (response.data.statusCode === 404) {
            this.showErrorMessage("Please provide valid information.");
          } else if (response.data.statusCode === 400) {
            this.showErrorMessage("Please provide valid information.");
          } else if (response.data.statusCode === 403) {
            this.showErrorMessage("You are not allowed to validate this affidavit.");
          }else if (response.data.verificationType === "CAC" && response.data.statusCode === 500) {
            this.showErrorMessage("Please provide valid information.");
          }  else {
            this.showErrorMessage("Something went wrong!");
          }
        } else {
          this.showErrorMessage("Something went wrong!");
        }
      },
      () => {
        this.showErrorMessage("Something went wrong!");
      }
    );
  }

  showErrorMessage(message: string) {
    this.errorFlag = true;
    this.errorMessage = "*" + message;
  }

  close() {
    this.dialogRef.close(this.message);
  }

  getAffidavitDetailsCreateDocument() {
    this.message = "Verified";
    localStorage.setItem("message", this.message);
    this.showCalendly = true;
    this.dialogRef.updateSize(NIN_DIALOG_SIZE.calendlyWidth, "auto");
  }

  private openSigningDialogAfterSchedule(result) {
    if (result && result.userSignatureRequired === false) {
      return;
    }
    const affidavitId = (result && result.affidavitId) || this.data.affidavitId;
    if (!affidavitId) {
      return;
    }
    this.signingDialogService
      .openUserSigning({
        affidavitId: affidavitId,
        dialog: this.dialog,
        name: this.data.name || this.userData.displayName,
        email: this.data.email || this.userData.email,
        allowDocumentRejection: true,
        openErrorMessage: "Meeting scheduled, but signing document could not be opened.",
      })
      .catch(() => {
        // SigningDialogService already shows the user-facing error.
      });
  }

  modalClosed(result) {
    this.showCalendly = false;
    this.dialogRef.updateSize(NIN_DIALOG_SIZE.compactWidth, "auto");
    const status = resolveDialogStatus(result);
    if (status === "Scheduled") {
      this.message = "Scheduled";
      localStorage.setItem("message", this.message);
      this.openSigningDialogAfterSchedule(result);
      this.close();
      return;
    }
    if (status === "SigningFailed") {
      this.message = "Scheduled";
      localStorage.setItem("message", this.message);
      this.showErrorMessage((result && result.signingError) || "Meeting scheduled, but signing document was not sent.");
      return;
    }
    if (status === "SchedulingFailed") {
      this.message = "Verified";
      localStorage.setItem("message", this.message);
      this.showErrorMessage((result && result.schedulingMessage) || "Meeting could not be scheduled.");
      return;
    }
    if (status) {
      this.message = "Scheduled";
      localStorage.setItem("message", this.message);
      this.close();
    }
  }
}
