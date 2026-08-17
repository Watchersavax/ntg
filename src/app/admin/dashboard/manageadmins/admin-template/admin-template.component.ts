import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatDialog, Sort, MatDialogRef } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { Category } from 'src/app/shared/models/Category';
import { CategoryList } from 'src/app/shared/models/CategoryList';
import { NewTemplateVersionResponse } from 'src/app/shared/models/NewTemplateVersionResponse';
import { TableRows } from 'src/app/shared/models/TableRows';
import { NewTemplateListResponse } from 'src/app/shared/models/TemplateListResponse';
import { NewTemplateVersion } from 'src/app/shared/models/TemplateVersion';
import { environment } from 'src/environments/environment';
import { AddTemplateDialogComponent } from '../../manageTemplates/manageTemplatesDialog/add-template-dialog/add-template-dialog.component';
import { AddTemplateVersionDialogComponent } from '../../manageTemplates/manageTemplatesDialog/add-template-version-dialog/add-template-version-dialog.component';
import { DeleteTemplateDialogComponent } from '../../manageTemplates/manageTemplatesDialog/delete-template-dialog/delete-template-dialog.component';
import { DesignDescriptionPageDialogComponent } from '../../manageTemplates/manageTemplatesDialog/design-description-page-dialog/design-description-page-dialog.component';
import { EditTemplateDialogComponent } from '../../manageTemplates/manageTemplatesDialog/edit-template-dialog/edit-template-dialog.component';
import { PreviewTemplateDialogComponent } from '../../manageTemplates/manageTemplatesDialog/preview-template-dialog/preview-template-dialog.component';
import { VersionPublishedTemplateDialogComponent } from '../../manageTemplates/manageTemplatesDialog/version-published-template-dialog/version-published-template-dialog.component';

@Component({
  selector: 'app-admin-template',
  templateUrl: './admin-template.component.html',
  styleUrls: ['./admin-template.component.css']
})
export class AdminTemplateComponent implements OnInit {

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
  userName;
  userId;
  @ViewChild(MatSort, { static: true }) matsort: MatSort;

  constructor(private activeroute: ActivatedRoute,public dialog: MatDialog, public router: Router, public http: HttpClient, private loadingscreenservice: LoadingscreenService) {
    this.activeroute.queryParams.subscribe(params => {
      this.userId = params.uid;
      this.userName = params.uname;
    });

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
        switchMap(() => ajax(environment.url + "admin/template/all/" + this.userId+ "/" + this.currentpage + "/" + this.pagesize + "?keyword=" + this.categorytosearch + "&sort=" + this.sort + "&order=" + this.order))
      );

      this.typeahead.subscribe(data => {

        this.filterListAccToFilterString(data.response.data);

      }, () => {

      });
    }
      , 0);

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
      for (let j = 0; j < tempelement.templateVersion.length; j++) {
        if (tempelement.templatePublishedVersion === tempelement.templateVersion[j].templateVersionId) {
          this.check[dataobj[i].templateId].push(true);
        } else {
          this.check[dataobj[i].templateId].push(false);
        }
      }
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
              let index = this.ELEMENT_DATA[element.serialno - 1].templateVersion.indexOf(version);
             
              this.ELEMENT_DATA[element.serialno - 1].templateVersion.splice(index, 1);
              this.sortedData = this.ELEMENT_DATA;
              
              this.check[element.templateId] = [];
              for (let index = 0; index < this.ELEMENT_DATA[element.serialno - 1].templateVersion.length; index++) {
                if (element.templatePublishedVersion === this.ELEMENT_DATA[element.serialno - 1].templateVersion[index].templateVersionId) {
                  this.check[element.templateId].push(true);
                } else {
                  this.check[element.templateId].push(false);
                }
              }
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
  previewTemplateEvent(element) {
    this.selectWorkingTemplate(element, event);

    let dialogref = this.dialog.open(PreviewTemplateDialogComponent, {
      data: { element }
    });

    dialogref.afterClosed().subscribe(response => {
      this.selectWorkingTemplate(element, event);
    });
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

        for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
          if (element.templateId === this.ELEMENT_DATA[i].templateId) {
            this.ELEMENT_DATA[i].templateVersion.unshift(templatenewversion);
            this.check[element.templateId].unshift(templatenewversion.published);
          }
        }

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

              for (let j = 0; j < this.ELEMENT_DATA[i].templateVersion.length; j++) {

                if (this.ELEMENT_DATA[i].templateVersion[j].templateVersionId === version.templateVersionId) {

                  this.ELEMENT_DATA[i].templateVersion[j] = { ...templatenewversion };

                }
              }
            }

          }
        }
        this.sortedData = this.ELEMENT_DATA;
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
            { "templateId": row.templateId, "templatePublishedVersion": row.templateVersion[j].templateVersionName }
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

  clearSearchBar() {
    document.getElementById('searchbar')['value'] = '';
  }

  fetchTemplateList() {

    this.ELEMENT_DATA = [];
    
    this.http.get(environment.url + "admin/template/all/" + this.userId+ "/" + this.currentpage + "/" + this.pagesize, { params: this.httpParams }).subscribe(
      (data: string) => {

        let dataobj: NewTemplateListResponse = { ...JSON.parse(JSON.stringify(data)) };
        if (dataobj.success === true) {

          for (let i = 0; i < dataobj.data.length; i++) {
            this.check[dataobj.data[i].templateId] = [];
            let tempelement: TableRows = { "serialno": (i + 1), ...dataobj.data[i] };
            for (let j = 0; j < tempelement.templateVersion.length; j++) {
              if (tempelement.templatePublishedVersion === tempelement.templateVersion[j].templateVersionId) {
                this.check[dataobj.data[i].templateId].push(true);
              } else {
                this.check[dataobj.data[i].templateId].push(false);
              }
            }
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
    this.currentpage++;
    this.http.get(environment.url + "admin/template/all/"  + this.userId+ "/" + this.currentpage + "/" + this.pagesize, { params: this.httpParams }).subscribe(
      (data: string) => {

        let dataobj: NewTemplateListResponse = { ...JSON.parse(JSON.stringify(data)) };
        if (dataobj.success === true) {

          for (let i = 0; i < dataobj.data.length; i++) {
            this.check[dataobj.data[i].templateId] = [];
            let tempelement: TableRows = { "serialno": (i + 1), ...dataobj.data[i] };
            for (let j = 0; j < tempelement.templateVersion.length; j++) {
              if (tempelement.templatePublishedVersion === tempelement.templateVersion[j].templateVersionId) {
                this.check[dataobj.data[i].templateId].push(true);
              } else {
                this.check[dataobj.data[i].templateId].push(false);
              }
            }
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
