import { HttpClient } from "@angular/common/http";
import { Component, Inject, OnInit, Pipe, PipeTransform } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { UserAffidavitSaveRequest } from "src/app/shared/models/UserAffidavitSaveRequest";
import { environment } from "src/environments/environment";
import { Court } from "../../user-models/Court";
import { TemplateFinalViewComponent } from "../../template-final-view/template-final-view.component";
import { PriceSelectionDialogComponent } from "../../price-selection-dialog/price-selection-dialog.component";
import { UserdataService } from "../../userservices/userdata.service";
import { TableRows } from "src/app/shared/models/TableRows";
import { AffidavitRecreationService } from "src/app/services/affidavit-recreation.service";
import { isRecreationContext } from "src/app/shared/utils/recreation.util";

declare var mammoth: any;

@Pipe({ name: "safeHtml" })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: string) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: "app-user-upload-affidavit",
  templateUrl: "./user-upload-affidavit.component.html",
  styleUrls: ["./user-upload-affidavit.component.css"],
})
export class UserUploadAffidavitComponent implements OnInit {
  selectedFile: File;
  selectedTemplateobj = new TableRows();
  courts: Court[] = [];
  fileToConvert: File;
  urls: string = environment.url + "user/template/";
  errorflag: boolean = false;
  errormessage: string = "";
  successflag = false;
  successmessage = "";
  selectedCourt;
  uploadForm: FormGroup;
  templatePrice;
  templateFastTrackPrice;
  message;
  recreationContext;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: Router,
    public dialogRef: MatDialogRef<UserUploadAffidavitComponent>,
    private activatedRoute: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,private userdataservice: UserdataService,
    private affidavitRecreationService: AffidavitRecreationService
  ) {}

  ngOnInit() {
    localStorage.setItem("message","");
    this.recreationContext = this.data && this.data.recreationContext;
    this.dataInitialization();
    this.uploadForm = new FormGroup({
      file: new FormControl("", [Validators.required]),
      court: new FormControl("", [Validators.required]),
    });
    this.getCourts();
  }

  dataInitialization(){
    if (this.isRecreationMode()) {
      this.templatePrice = this.data.templatePrice;
      this.templateFastTrackPrice = this.data.templateFastTrackPrice;
      return;
    }

    this.userdataservice.fetchTemplateForSystemGenerated().subscribe(data => {
        
        if (data["success"] === true) {
          this.selectedTemplateobj = data["data"];
          this.templatePrice = this.selectedTemplateobj.templatePrice;
          this.templateFastTrackPrice = this.selectedTemplateobj.templateFastTrackPrice;
        }
      },() =>{
      
      });
  }

  getAllCourt(): Observable<Court[]> {
    return this.http.get<Court[]>(this.urls + "getAllCourtsByTemplate");
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
        : fileName;
    const fileInput = event.target.nextElementSibling;
    fileInput.value = fileName;
    this.selectedFile = { ...this.selectedFile, name: trimmedFileName };
    this.fileToConvert = event.target.files[0];
    if (this.courts.length > 0) {
      this.uploadForm.get("court").setValue(this.courts[0].courtId);
    }
  }

  upload(): void {
    if (!this.selectedFile) {
      this.showErrorMessage(
        "No file selected. Please select a file in either .docx or .pdf format."
      );
      return;
    }
    if (this.uploadForm.valid) {
      if (this.isRecreationMode()) {
        this.processSelectedFile(this.recreationContext.isExpress === true);
        return;
      }
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
                this.saveUploadAffidavit(html,null, fileName,isExpress);
              })
              .catch(() => {
                this.showErrorMessage("Upload failed.");
              });
          } else if (fileExtension === 'pdf') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const pdfData = reader.result as string; 
                this.saveUploadAffidavit(null, pdfData, fileName,isExpress); 
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

  saveUploadAffidavit(html: string| null, pdfData: String | null, fileName: string, isExpress: boolean) {
    this.selectedCourt = this.uploadForm.get('court').value;
    const userAffidavit = new UserAffidavitSaveRequest();
    userAffidavit.userAffidavitId = 0;
    userAffidavit.userId = JSON.parse(localStorage.getItem('userdata'))['userId'];
    userAffidavit.htmlValue = html !== null ? JSON.stringify(html) : null;
    userAffidavit.status = 'Pending';
    userAffidavit.isUploaded = true;
    userAffidavit.userAffidavitCustomName = fileName;
    userAffidavit.courtId = this.selectedCourt;
    userAffidavit.isExpress = isExpress;
    const formData = new FormData();
    if (this.fileToConvert.type === "application/pdf") {
      formData.append("file", this.fileToConvert);
    }
    if (this.isRecreationMode()) {
      const recreationRequest = {
        sourceAffidavitId: this.recreationContext.sourceAffidavitId,
        htmlValue: userAffidavit.htmlValue,
        userAffidavitCustomName: userAffidavit.userAffidavitCustomName,
        courtId: userAffidavit.courtId
      };
      formData.append("userAffidavit", JSON.stringify(recreationRequest));
      this.affidavitRecreationService.submitUploadRecreation(formData).subscribe(errorMessage => {
        if (errorMessage) {
          this.showErrorMessage(errorMessage);
          return;
        }
        this.dialogRef.close();
        this.affidavitRecreationService.navigateToVerifiedDocuments(false);
      });
      return;
    }
    formData.append("userAffidavit", JSON.stringify(userAffidavit));
    this.http.post(this.urls + "saveAffidavitForUpload", formData).subscribe(
      (response: any) => {
        const userAffidavitData = response.data;
        if (userAffidavitData != null) {
          this.dialogRef.close();
          this.openFinalPreview(JSON.parse(userAffidavit.htmlValue), userAffidavitData.userAffidavitId, false,userAffidavitData.pdfData,userAffidavitData.isExpress);
        
        }
      },
      () => {
        this.showErrorMessage("Upload failed.");
      }
    );
  }

  showErrorMessage(message) {
    this.errorflag = true;
    this.successflag = false;
    this.errormessage = "*" + message;
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
            this.uploadForm.get("court").setValue(courtId);
          }
        }
      },
      () => {
        
      }
    );
  }

  openFinalPreview(templateValue, useraffidavitIdtemp, previewFlag,pdfData,isExpress) {
    const tempprice = isExpress ? this.templateFastTrackPrice : this.templatePrice;

    const dialogRef = this.dialog.open(TemplateFinalViewComponent, {
      data: {
        templatevalue: templateValue,
        previewflag: previewFlag,
        useraffidavitId: useraffidavitIdtemp,
        price: tempprice,
        pdfData:pdfData,
        isExpress:isExpress
      }
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
        this.route.navigate(["/user", "myaccount", "documents", this.message]);
      });
    });

    return dialogRef;
  }

  private isRecreationMode(): boolean {
    return isRecreationContext(this.recreationContext);
  }
}
