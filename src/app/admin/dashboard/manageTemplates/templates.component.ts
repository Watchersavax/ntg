import { Component, OnInit, ViewChild } from "@angular/core";

import { MatSort, Sort } from "@angular/material/sort";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

import { Router } from "@angular/router";
import { EditTemplateDialogComponent } from "./manageTemplatesDialog/edit-template-dialog/edit-template-dialog.component";
import { DeleteTemplateDialogComponent } from "./manageTemplatesDialog/delete-template-dialog/delete-template-dialog.component";
import { VersionPublishedTemplateDialogComponent } from "./manageTemplatesDialog/version-published-template-dialog/version-published-template-dialog.component";
import { AddTemplateDialogComponent } from "./manageTemplatesDialog/add-template-dialog/add-template-dialog.component";
import { AddTemplateVersionDialogComponent } from "./manageTemplatesDialog/add-template-version-dialog/add-template-version-dialog.component";
import { PreviewTemplateDialogComponent } from "./manageTemplatesDialog/preview-template-dialog/preview-template-dialog.component";
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { TableRows } from 'src/app/shared/models/TableRows';
import { NewTemplateListResponse } from 'src/app/shared/models/TemplateListResponse';
import { Category } from 'src/app/shared/models/Category';
import { CategoryList } from 'src/app/shared/models/CategoryList';
import { NewTemplateVersionResponse } from 'src/app/shared/models/NewTemplateVersionResponse';
import { NewTemplateVersion } from 'src/app/shared/models/TemplateVersion';

import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { unwrapResponse } from 'src/app/shared/utils/unwrap-response.util';
import { DesignDescriptionPageDialogComponent } from './manageTemplatesDialog/design-description-page-dialog/design-description-page-dialog.component';
import { fromEvent, of } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: "app-templates",
  templateUrl: "./templates.component.html",
  styleUrls: ["./templates.component.css"]
})
export class TemplatesComponent implements OnInit {

  ELEMENT_DATA: TableRows[] = [];
  categories: Category[] = [];
  categoriesname: string[] = [];
  check = {};
  categorytosearch: string;
  step = -1;
  sortedData: TableRows[];
  currentpage = 0;
  pagesize = 15;
  datamessage = "";
  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 2;
  infinitescrolldisable = false;
  direction = '';
  searchBox: HTMLElement;
  typeahead;
  sort = 'templateId';
  order = 'DESC';
  httpParams;
  @ViewChild(MatSort, { static: true }) matsort: MatSort;
  templateVersions: NewTemplateVersion[] =[];
  showTemplateVersions = false;
  docUrl: string = ''

  constructor(public dialog: MatDialog, public router: Router, public http: HttpClient, private loadingscreenservice: LoadingscreenService) {

  }

  removeFilters() {
    this.matsort.active = 'templateId';
    this.matsort.direction = 'desc';
    this.matsort._stateChanges.next();
  }

  ngOnInit() {
    this.createHttpParams();
    this.fetchTemplateList();
    this.fetchCategoryList();

    setTimeout(() => {
      this.searchBox = document.getElementById('searchbar');

      this.typeahead = fromEvent(this.searchBox, 'input').pipe(
        map((e: KeyboardEvent) => e.target["value"]),
        filter(text => text.length >= 0),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap(() => {
          return this.http.get<any>(
            `${environment.url}admin/template/all/${this.currentpage}/${this.pagesize}?keyword=${this.categorytosearch}&sort=${this.sort}&order=${this.order}`
          ).pipe(
            catchError(error => {
              this.loadingscreenservice.stopLoading();
              return of({ success: false, total: 0, data: [] }); 
            })
          );
        })
      );

      this.typeahead.subscribe(
        (data: any) => {
          if (data && data.success && data.data) {
            this.filterListAccToFilterString(data.data);
          } else {
          }
        },
        (error) => {
        }
      );
    }, 0);
  }

  putValuesBackToDefault(event) {
    this.currentpage = 0;
    this.infinitescrolldisable = false;
  }

  filterListAccToFilterString(dataobj) {

    this.ELEMENT_DATA = [];
    this.sortedData = [];
    for (let i = 0; i < dataobj.length; i++) {
      this.check[dataobj[i].templateId] = [];
      let tempelement: TableRows = { "serialno": (i + 1), ...dataobj[i] };
      this.ELEMENT_DATA.push(tempelement);
    }
    this.sortedData = this.ELEMENT_DATA;

  }

  /**
	 * This method opens up a dialog to edit template details
	 * @author Mritunjay yadav
   * @param  this method takes input parameter as row detailed object and Event object  
	 * @return void.
	 */
  editTemplateEvent(element: TableRows, event) {

    this.selectWorkingTemplate(element, event);
    let dialogref = this.dialog.open(EditTemplateDialogComponent, {
      data: { ...this.ELEMENT_DATA[element.serialno - 1], "categoriesarray": this.categories, "categoriesnamearray": this.categoriesname }

    });

    dialogref.afterClosed().subscribe(response => {
      
      if (response === "false" || response === undefined) {

        return;
      }
      
      for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
        if (element.templateId === this.ELEMENT_DATA[i].templateId) {
          this.ELEMENT_DATA[i] = { "serialno": element.serialno, ...response };
          
        }
      }
      this.currentpage = 0;
      this.fetchTemplateList();
      this.sortedData = this.ELEMENT_DATA;
    });

  }

  /**
	 * This method opens up a dialog to delete A version of template or Complete template in case when there is no version inside it
	 * @author Mritunjay yadav
   * @param  this method takes input parameter as row detailed object , in case of version delete version row detailed object and  Event object  
	 * @return void.
	 */
  deleteTemplateEvent(element: TableRows, version: NewTemplateVersion, i, j) {
    this.selectWorkingTemplate(element, event);
    if (version != null && version != undefined) {

      this.openAlertDialogBox("Delete Version", "Do you want to delete this version ?", false).afterClosed().subscribe(data => {
        if (data === 'Yes') {

          //call api to delete particular version from server
          this.http.post(environment.url + "admin/template/deleteTemplateVersion/" + version.templateVersionId, {}).subscribe((data) => {
           
            if (data["success"] === true) {

              this.currentpage = 0;
              this.fetchTemplateList();
            } else {

            }

          }, () => {

          });

        }
      });

      this.selectWorkingTemplate(element, event);
      return;
    }

    let dialogref = this.dialog.open(DeleteTemplateDialogComponent, {
      data: { ...this.ELEMENT_DATA[element.serialno - 1] }
    });

    dialogref.afterClosed().subscribe((result) => {
      if (result === "Yes") {
        this.ELEMENT_DATA.splice(element.serialno - 1, 1);

        for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
          this.ELEMENT_DATA[i].serialno = i + 1;
        }
        this.sortedData = this.ELEMENT_DATA;
        this.check[element.templateId] = null;

        if (this.ELEMENT_DATA.length < 15) {
          this.nextPage();
        }

      }
    })
  }

  /**
	 * This method opens up a dialog to show preview of the temlate 
	 * @author Mritunjay yadav
   * @param  this method takes input parameter as version row detailed object and Event object  
	 * @return void.
	 */

  previewTemplateEvent(row: any, version: any) {
   const fileName =`${row.templateName}-${version.templateVersionName}.pdf` ;
    this.previewPdf(row, version).then(() => {
     
      let dialogref = this.dialog.open(PreviewTemplateDialogComponent, {
        data: {
          docUrl: this.docUrl,
          fileName: fileName
        }
      });
  
      dialogref.afterClosed().subscribe(response => {
        this.selectWorkingTemplate(version, event);
      });
    }).catch(error => {
    });
  }

  previewPdf(row: any, version: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const element = document.createElement('div');
      element.innerHTML = `
      ${version.templateVersionValue}
      <style>
        ${version.templateVersionCss}
        .row {
          padding: 0px !important;
          min-height: unset !important;
        }

        div {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        img {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      </style>
    `;

      let templatespanelementarray: NodeListOf<HTMLElement> = element.querySelectorAll('span[cust_tag]');
      templatespanelementarray.forEach(span => {
        span.innerText = "___________ ";
        span.style.borderBottom = "0px";
      });
  
      // Convert all images to base64
      const images = element.querySelectorAll('img');
      const promises = Array.from(images).map(async (img: HTMLImageElement) => {
        const imgSrc = img.getAttribute('src') || '';
        if (!imgSrc.startsWith('data:image')) {
          try {
            const response = await fetch(imgSrc);
            const blob = await response.blob();
            const base64 = await this.convertBlobToBase64(blob);
            img.src = base64;
          } catch (error) {
            reject(error);
          }
        }
      });
  
      Promise.all(promises).then(() => {
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(element.innerHTML, "text/html");
        const serializer = new XMLSerializer();
        const updatedHtmlString = serializer.serializeToString(htmlDocument);
  
        const requestBody = {
          content: updatedHtmlString,
          fileName: `${row.templateName}-${version.templateVersionName}.pdf` 
        };
  
        this.http.post(`${environment.url}user/template/generate-pdf`, requestBody).subscribe((response: any) => {
          const payload = unwrapResponse(response);
          const base64Pdf = payload.fileBase64;
          if (base64Pdf) {
            try {
              const pdfBlob = this.base64ToBlob(base64Pdf, 'application/pdf');
              const url = window.URL.createObjectURL(pdfBlob);
              this.docUrl = url;  
              resolve();  
            } catch (error) {
              reject(error); 
            }
          } else {
            reject(new Error('No PDF received from server'));
          }
        }, error => {
          reject(error); 
        });
      });
    });
  }

  downloadPDF(row: any, version: any): void {
    const element = document.createElement('div');
    element.innerHTML = `
      ${version.templateVersionValue}
      <style>
        ${version.templateVersionCss}
        .row {
          padding: 0px !important;
          min-height: unset !important;
        }
        
        div {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        img {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      </style>
    `;

    let templatespanelementarray: NodeListOf<HTMLElement> = element.querySelectorAll('span[cust_tag]');
    templatespanelementarray.forEach(span => {
      span.innerText = "___________ ";
      span.style.borderBottom = "0px";
    });
  
    // Convert all images to base64
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map(async (img: HTMLImageElement) => {
      const imgSrc = img.getAttribute('src') || '';
      if (!imgSrc.startsWith('data:image')) {
        try {
          const response = await fetch(imgSrc);
          const blob = await response.blob();
          const base64 = await this.convertBlobToBase64(blob);
          img.src = base64;
        } catch (error) {
          console.error('Error converting image to base64:', error);
        }
      }
    });

    Promise.all(promises).then(() => {
      const parser = new DOMParser();
      const htmlDocument = parser.parseFromString(element.innerHTML, "text/html");
      const serializer = new XMLSerializer();
      const updatedHtmlString = serializer.serializeToString(htmlDocument);
  
      const requestBody = {
        content: updatedHtmlString,
        fileName: `${row.templateName}-${version.templateVersionName}.pdf` 
      };
      this.http.post(`${environment.url}user/template/generate-pdf`, requestBody).subscribe((response: any) => {
        const payload = unwrapResponse(response);
        const base64Pdf = payload.fileBase64;
        if (base64Pdf) {
          try {
            const pdfBlob = this.base64ToBlob(base64Pdf, 'application/pdf');
            const url = window.URL.createObjectURL(pdfBlob);
            this.docUrl = url;
            window.open(url, '_blank');
            // // Clean up
            
          } catch (error) {
          }
        } else {
        }
      }, error => {
      });
    });
  }
  
  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  base64ToBlob(base64: string, mimeType: string): Blob {
    const base64String = base64.replace(/^data:[a-z]+\/[a-z]+;base64,/, '');
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
	 * This method opens up a dialog to add new version for a template 
	 * @author Mritunjay yadav
   * @param  this method takes input parameter as row detailed object and Event object  
	 * @return void.
	 */
  addTemplateVersionEvent(element: TableRows, event) {
    
    this.selectWorkingTemplate(element, event);
    let dialogref = this.dialog.open(AddTemplateVersionDialogComponent, {
      data: { ...this.ELEMENT_DATA[element.serialno - 1] }
    });

    dialogref.afterClosed().subscribe(response => {
      if (response === "false") {
       
      } else if (response === undefined) {
       
      } else {
        let templatenewversion = new NewTemplateVersion();
        templatenewversion.archive = response["archive"];
        templatenewversion.published = response["published"];
        templatenewversion.templateId = response["templateId"];
        templatenewversion.templateVersionAsset = response["versionAsset"];
        templatenewversion.templateVersionComponent = response["versionComponent"];
        templatenewversion.templateVersionCss = response["versionCss"];
        templatenewversion.templateVersionId = response["versionId"];
        templatenewversion.templateVersionName = response["versionName"];
        templatenewversion.templateVersionStyles = response["versionStyles"];
        templatenewversion.templateVersionValue = response["versionValue"];
        templatenewversion.templateVersionDescriptionHtml = response["versionDescriptionHtml"];

        this.currentpage = 0;
        this.fetchTemplateList();

        this.sortedData = this.ELEMENT_DATA;
        this.openTemplateVersionDesign(templatenewversion, element);
      }
    });

  }

  /**
	 * This method opens up a dialog to edit template details
	 * @author Mritunjay yadav
   * @param  this method takes input parameter as row detailed object and Event object  
	 * @return void.
	 */
  openTemplateVersionDesign(version: NewTemplateVersion, row: TableRows) {
    this.loadingscreenservice.startLoading();
    this.selectWorkingTemplate(row, event);
    let dialogref = this.dialog.open(VersionPublishedTemplateDialogComponent, {
      data: { ...version }
    });

    dialogref.afterClosed().subscribe((response) => {
      
      if (response != undefined) {

        let templatenewversion = new NewTemplateVersion();
        templatenewversion.archive = response["archive"];
        templatenewversion.published = response["published"];
        templatenewversion.templateId = response["templateId"];
        templatenewversion.templateVersionAsset = response["versionAsset"];
        templatenewversion.templateVersionComponent = response["versionComponent"];
        templatenewversion.templateVersionCss = response["versionCss"];
        templatenewversion.templateVersionId = response["versionId"];
        templatenewversion.templateVersionName = response["versionName"];
        templatenewversion.templateVersionStyles = response["versionStyles"];
        templatenewversion.templateVersionValue = response["versionValue"];
        templatenewversion.templateVersionDescriptionHtml = response["templateVersionDescriptionHtml"]; 
        
        if (response instanceof NewTemplateVersion) {
          for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
            if (row.templateId === this.ELEMENT_DATA[i].templateId) {

            }

          }
        }
        this.sortedData = this.ELEMENT_DATA;
        this.getTemplateVersions(row)
        this.selectWorkingTemplate(row, event);

      } else {
      }
    });

  }

  /**
	 * This method runs when admin slide the button for publish or non publish a template version 
	 * @author Mritunjay yadav
   * @param  this method takes input template array index (i), version array index (j) , and row object from table
	 * @return void.
	 */
  onSlide(i, j, row: TableRows) {

    if (this.check[row.templateId][j] === false) {
      
      this.check[row.templateId][j] = false;
      this.http.post(environment.url + "admin/template/unpublishAllVersions", { "templateId": row.templateId }).subscribe((data: NewTemplateVersionResponse) => {

        if (data.success === true) {
          this.selectWorkingTemplate(row, event);
        }
        else {

        }

      }, () => {

      });

    } else {
      for (let ind = 0; ind < this.check[row.templateId].length; ind++) {
        
        if (ind === j) {
          this.check[row.templateId][ind] = true;
          this.http.post(environment.url + "admin/template/updateVersionStatus",
            { "templateId": row.templateId, "templatePublishedVersion":this.templateVersions[j].templateVersionName }
          ).subscribe((data: NewTemplateVersionResponse) => {

            if (data.success === true) {

              this.selectWorkingTemplate(row, event);

            }
            else {

            }

          }, () => {

          });

        } else {
          this.check[row.templateId][ind] = false;
        }
      }
    }
  
  }

  /**
	 * This method opens up a dialog for creating template description page for showing it on user side 
	 * @author Mritunjay yadav
   * @param  this method takes input parameter as row detailed object   
	 * @return void.
	 */
  desingDescriptionPage(version: NewTemplateVersion) {
    let dialogref = this.dialog.open(DesignDescriptionPageDialogComponent, {
      data: { ...version }
    });
    dialogref.afterClosed().subscribe(data => {
      if (data != 'close') {
        
        version.templateVersionDescriptionHtml = data["templateVersionDescriptionHtml"];
       
      }
    });
  }

  /**
   * @description opens up the module to add new Template
   * @param element
   */
  addNewTemplate() {
    
    let dialogref = this.dialog.open(AddTemplateDialogComponent, {
      data: { "categoriesarray": this.categories, "categoriesnamearray": this.categoriesname }
    });
    let elementobj: TableRows;
    dialogref.afterClosed().subscribe(response => {
      
      if (response === "false" || response == undefined) {
        
      } else {

      }
      this.currentpage = 0;
      this.sort = 'templateId';
      this.order = 'DESC';
      this.createHttpParams();
      this.fetchTemplateList();
      this.fetchCategoryList();
      this.removeFilters();
    });

  }

  expand(row: TableRows){
    this.showTemplateVersions = false;
    this.getTemplateVersions(row)
  }
  clearSearchBar() {
    document.getElementById('searchbar')['value'] = '';
  }
  getTemplateVersions(row: TableRows){
    this.http.get(environment.url + "admin/template/templateVersions/" + row.templateId).subscribe(
      (data: string) => {
        if (data['success'] === true) {
          this.templateVersions = data['data'];
          for (let j = 0; j < this.templateVersions.length; j++) {
              if (row.templatePublishedVersion === this.templateVersions[j].templateVersionId) {
                this.check[row.templateId].push(true);
              } else {
                this.check[row.templateId].push(false);
              }
            }
            this.showTemplateVersions = true;
        }
      });
  }

  fetchTemplateList() {
    this.createHttpParams();
    this.ELEMENT_DATA = [];
    
    this.http.get(environment.url + "admin/template/all/" + this.currentpage + "/" + this.pagesize, { params: this.httpParams }).subscribe(
      (data: string) => {

        let dataobj: NewTemplateListResponse = { ...JSON.parse(JSON.stringify(data)) };
        if (dataobj.success === true) {

          for (let i = 0; i < dataobj.data.length; i++) {
            this.check[dataobj.data[i].templateId] = [];
            let tempelement: TableRows = { "serialno": (i + 1), ...dataobj.data[i] };
            this.ELEMENT_DATA.push(tempelement);
          }
          this.sortedData = this.ELEMENT_DATA;

        } else {
          
        }

      },
      () => {
      }
    );
  }

  fetchCategoryList() {

    //fetch category list 
    this.http.get(environment.url + "admin/template/templateCategories").subscribe((data: CategoryList) => {
      
      this.categories = data.data;
      this.categoriesname = [];
      for (let i = 0; i < this.categories.length; i++) {
        this.categoriesname.push(this.categories[i].templateCategoryName);
      }
     
    });
  }

  selectWorkingTemplate(element, event) {
    
    for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
      if (element.templateId == this.ELEMENT_DATA[i].templateId) {
        this.setStep(i);
      }
    }
    
    if(!!event)
      event.stopPropagation();
  }

  setStep(index: number) {
    this.step = index;
  }

  nextPage() {
    this.createHttpParams();
    this.currentpage++;
    this.http.get(environment.url + "admin/template/all/" + this.currentpage + "/" + this.pagesize, { params: this.httpParams }).subscribe(
      (data: string) => {

        let dataobj: NewTemplateListResponse = { ...JSON.parse(JSON.stringify(data)) };
        if (dataobj.success === true) {

          for (let i = 0; i < dataobj.data.length; i++) {
            this.check[dataobj.data[i].templateId] = [];
            let tempelement: TableRows = { "serialno": (i + 1), ...dataobj.data[i] };
            this.ELEMENT_DATA.push(tempelement);
          }

          for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
            this.ELEMENT_DATA[i].serialno = i + 1;
          }

          this.sortedData = this.ELEMENT_DATA;

        } else {

        }

      },
      () => {

      }

    );
  }

  sortData(sort: Sort) {

    if (!sort.active || sort.direction === '') {
      this.sort = 'templateId';
      this.order = 'DESC';
    } else {
      this.sort = sort.active;
      this.order = sort.direction.toUpperCase();
    }

    this.putValuesBackToDefault(null);
    this.createHttpParams();
    this.fetchTemplateList();

  }

  compare = (a: number | string, b: number | string, isAsc: boolean) => {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  openAlertDialogBox(actionnamestrign, messagestring, onlycloseflag): MatDialogRef<AlertdialogComponent> {
    let dialogref = this.dialog.open(AlertdialogComponent, {
      "data": { actionname: actionnamestrign, message: messagestring, onlyclose: onlycloseflag }
    });

    return dialogref;
  }

  createHttpParams() {
    this.httpParams = new HttpParams()
      .set('page', this.currentpage.toString())
      .set('size', this.pagesize.toString())
      .set('keyword', !!this.categorytosearch ? this.categorytosearch : '')
      .set('sort', !!this.sort ? this.sort : 'templateId')
      .set('order', !!this.order ? this.order : 'DESC');
  }

}
