import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NewTemplateVersion, TemplateVersion } from 'src/app/shared/models/TemplateVersion';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-design-description-page-dialog',
  templateUrl: './design-description-page-dialog.component.html',
  styleUrls: ['./design-description-page-dialog.component.css']
})
export class DesignDescriptionPageDialogComponent implements OnInit {

  public Editor = ClassicEditor;
  editorData = "<p>Create personalised pages for this template version</p>"
  ckeConfig; 
  templateVersionobj = new NewTemplateVersion();
  versionrequestobj = new TemplateVersion();

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogref: MatDialogRef<DesignDescriptionPageDialogComponent>,private http:HttpClient) {
    
    this.dialogref.disableClose = true;
    this.templateVersionobj = data;

    if(this.templateVersionobj.templateVersionDescriptionHtml != null)
      this.editorData = this.templateVersionobj.templateVersionDescriptionHtml;

   }

  ngOnInit() {
    this.ckeConfig = {
      //   { name: "links", items: ["Link", "Unlink", "Anchor"] },
      //   { name: "clipboard", items: ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "-", "Undo", "Redo"] },
        //     'X-CSRF-TOKEN': 'CSFR-Token',
        // // Headers sent along with the XMLHttpRequest to the upload server.
        // The URL that the images are uploaded to.
      extraPlugins: 'divarea',

    };
  }

  public onReady( editor ) {
    editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
    );
}

  close(){
    this.dialogref.close("close");
  }

  checkDataOnChange(){
    
  }

  onFileUploadResponse(event){
    
  }

  onFileUploadRequest(event){
    
  }

  onSubmit(){

      this.versionrequestobj.versionValue=this.templateVersionobj.templateVersionValue;
      this.versionrequestobj.versionCss = this.templateVersionobj.templateVersionCss;
      this.versionrequestobj.templateId = this.templateVersionobj.templateId;
      this.versionrequestobj.versionId = this.templateVersionobj.templateVersionId;
      this.versionrequestobj.archive = this.templateVersionobj.archive;
      this.versionrequestobj.published = this.templateVersionobj.published;
      this.versionrequestobj.versionName = this.templateVersionobj.templateVersionName;
      this.versionrequestobj.versionComponent = this.templateVersionobj.templateVersionComponent;
      this.versionrequestobj.versionAsset = this.templateVersionobj.templateVersionAsset;
      this.versionrequestobj.versionStyles = this.templateVersionobj.templateVersionStyles;
      this.templateVersionobj.templateVersionDescriptionHtml = this.editorData;
      this.versionrequestobj.versionDescriptionHtml = this.templateVersionobj.templateVersionDescriptionHtml;

    this.http.post(environment.url + "admin/template/saveTemplateVersionDescriptionPage",this.versionrequestobj).subscribe(
      (data: any) => {

       if(data["success"] === true){
          this.dialogref.close(this.templateVersionobj);
         }else{
           
         }
      },() => {
        
        window.alert("Template can't save right now");
        this.dialogref.close("close");
      }
    );

  }
}
