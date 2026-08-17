import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserdataService } from '../userservices/userdata.service';
import html2pdf from 'html2pdf.js';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { downloadBlob } from 'src/app/shared/utils/download-blob.util';
import { SigningDocumentService } from 'src/app/services/signing-document.service';

@Component({
  selector: 'app-template-final-view',
  templateUrl: './template-final-view.component.html',
  styleUrls: ['./template-final-view.component.css']
})
export class TemplateFinalViewComponent implements OnInit {

  previewflag = false;
  templateId ;
  templateprice;
  useraffidavitId;
  templateName;
  templatecustomname;
  actualdocumentname;

  affidavitprice;
  affidavitId;
  documentname;
  registerStatus;
  downloadbuttonflag:Boolean;
  pdfData;
  isExpress;
  shouldOpenPriceDialog: boolean = false;

  pdfSource;
  totalPages!: number;
  isLoaded: boolean = false;
  page: number = 1;
  filename: string = '';

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<TemplateFinalViewComponent>,
  private router : Router,private dataservice:UserdataService,private signingDocumentService:SigningDocumentService) {
    dialogRef.disableClose = true;
    
  }

  ngOnInit() {
    this.pdfSource = this.data["docUrl"];
    this.registerStatus=this.data["registerStatus"];
    this.isExpress = this.data["isExpress"];
   if(this.registerStatus ==='Approved'){
    this.downloadbuttonflag=true
   }
    this.previewflag = this.data["previewflag"];

    this.templateName = this.data["templateName"];
    this.templatecustomname = this.data["templatecustomName"];

    if(this.templatecustomname == undefined || this.templatecustomname == ""){
      this.actualdocumentname = this.templateName;
    }else{
      this.actualdocumentname = this.templatecustomname;
    }

    if(this.data["price"] != undefined && this.data["price"] != null){

      this.templateprice = this.data["price"];
    
    }else{

    this.templateId = this.data["templateId"];
    if(this.templateId != undefined){
    this.dataservice.fetchTemplateObjectById(this.templateId).subscribe(data=>{
      if(data["success"]=== true){
        if(this.isExpress){
          this.templateprice = data["data"]["templateFastTrackPrice"];
        }else{
          this.templateprice = data["data"]["templatePrice"];
        }
      
      }
    },() =>{
      
    });
  }

  }

  this.useraffidavitId = this.data["useraffidavitId"];
  this.affidavitprice = this.templateprice;
  this.affidavitId = this.useraffidavitId;
  this.documentname = this.actualdocumentname;
  let htmlstring = this.data["templatevalue"];
  if (htmlstring) {
    htmlstring = htmlstring.replace(/row-cell/g,'rw-'+this.useraffidavitId+'-cell');
  }
  if (this.data["pdfData"]) {
    const byteCharacters = atob(this.data["pdfData"]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const reader = new FileReader();

    reader.onloadend = () => {
        const base64data = reader.result as string;
        this.pdfData = base64data; // Set the source for the PDF viewer
    };
    reader.readAsDataURL(blob);
    
  }
  }

  close(){
    this.dialogRef.close('Yes');
  }
  navigateToPayment(){
    this.close();
    this.router.navigate(['/user','makePayment'],{ queryParams: { p: this.templateprice,id:this.useraffidavitId,name:this.actualdocumentname} })

  }

  exportPdf(){
    const element = document.getElementById('templatePreview');
    const divElement = element.querySelector(':scope > div');
    const styleElement = divElement.querySelector('style');
    const css = styleElement.innerHTML;
    const replacedCss = css.replace(/height:\s*10px\s*;\s*background-color:\s*lightgray\s*;/g, 'height:0!important;background-color:transparent!important;');
    styleElement.innerHTML = replacedCss;
    
    this.generatePDF(element);
  }

  generatePDF(element: HTMLElement) {
      const newElement = element.cloneNode(true);
      const options = {
        margin: 0.5,
        image: { type: 'jpeg', quality: 0.98 },
        filename: this.templateName,
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
       
      };
      html2pdf().set(options).from(newElement).save();
  }

  downloadSignedPdf(): void {
    this.signingDocumentService.downloadSignedDocument(this.affidavitId).subscribe(blob => {
      downloadBlob(blob, this.documentname);
    }, error => {
    });
  }

  callBackFn(pdf: PDFDocumentProxy){
    this.totalPages=pdf.numPages;
    this.isLoaded = true;
  }

  nextPage(){
    this.page++;
  }

  prevPage(){
    this.page--;
  }
  
}
