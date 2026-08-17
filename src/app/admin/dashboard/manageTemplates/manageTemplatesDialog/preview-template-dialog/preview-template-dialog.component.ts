import { Component, OnInit, Inject, AfterViewInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormGroup } from "@angular/forms";
import { PDFDocumentProxy } from "ng2-pdf-viewer";

@Component({
  selector: "app-preview-template-dialog",
  templateUrl: "./preview-template-dialog.component.html",
  styleUrls: ["./preview-template-dialog.component.css"]
})
export class PreviewTemplateDialogComponent implements OnInit, AfterViewInit {
  editformgroup: FormGroup;
  tablerow;
  selectedversion = "";
  pdfSource;
  totalPages!: number;
  isLoaded: boolean = false;
  page: number = 1;
  filename: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogref: MatDialogRef<PreviewTemplateDialogComponent>) {

    this.pdfSource = data.docUrl;
    this.filename = data.fileName;
  }

  ngOnInit() {}

  onSubmit() {
   
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

  ngAfterViewInit(): void {

  }

  downloadPDF() {
    if (this.pdfSource) {
      const link = document.createElement('a');
      link.href = this.pdfSource;
      link.download = this.filename ? this.filename : 'template.pdf'; 
      link.click();
    } else {
    }
  }

}
