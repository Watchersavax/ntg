import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableRows } from 'src/app/shared/models/TableRows';
import { DataService } from '../userservices/data.service';
import { UserdataService } from '../userservices/userdata.service';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { NewTemplateListResponse } from 'src/app/shared/models/TemplateListResponse';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SubCategory } from 'src/app/shared/models/Category';
import { SubCategoryList } from 'src/app/shared/models/CategoryList';
import { MatDialog } from '@angular/material';
import { CaseRelatedAffidavitsComponent } from '../case-related-affidavits/case-related-affidavits.component';
import { TemplateHtmlSanitizerService } from 'src/app/shared/security/template-html-sanitizer.service';

@Component({
  selector: 'app-template-card-listing',
  templateUrl: './template-card-listing.component.html',
  styleUrls: ['./template-card-listing.component.css']
})
export class TemplateCardListingComponent implements OnInit {

  templatelist: TableRows[] = [];
  currentPage: number = 0;
  templatesPerPage: number = 6;
  lastPage: boolean = false;
  totalPages: number;
  userData: any;
  userType: String;
  PAGE_SIZE = 6;
  page = 0;
  prevflag = true;
  nextflag = false;
  dataMessage = '';
  allTemplateList: TableRows[] = [];
  mybreakpoint: number;
  subCategoryList: SubCategory[] = [];
  selectedSubCategoryId: number = 0; 
  selectedSubCategoryName: string = 'All';
  filtervalue: string = '';

  constructor( private dataService: DataService, private router: Router, private userdataservice: UserdataService,
    private loadingService: LoadingscreenService,private breakpointObserver: BreakpointObserver,private dialog: MatDialog,
    private templateHtmlSanitizer: TemplateHtmlSanitizerService) {
      this.userData = JSON.parse(localStorage.getItem('userdata'));
      if(this.userData.isAgent){
        this.userType='agent';
      }else if(this.userData.isCorporate){
        this.userType='corporate';
      }else{
        this.userType='individual';
      }

  }

  ngOnInit() {
    this.loadingService.startLoading();
    this.mybreakpoint = (window.innerWidth > 1024) ? 3 : (window.innerWidth > 600) ? 2 : 1;
    this.fetchAffidavitTypes();
    this.fetchDataFromTemplateList(this.selectedSubCategoryId, (isDataEmpty: boolean) => {
      if (isDataEmpty) {
        this.dataMessage = "* no more data available "; 
      }
    });
   
  }

  selectSubCategory(subCategoryId: number ) {
    this.selectedSubCategoryId = subCategoryId;
    const selectedSubCategory = this.subCategoryList.find(
      (subCategory) => subCategory.templateSubCategoryId === subCategoryId
    );

    this.selectedSubCategoryName = selectedSubCategory
      ? selectedSubCategory.templateSubCategoryName
      : '';

    this.page = 0; 
    this.currentPage = 0;
    this.dataMessage= '';
    this.templatelist = [];
    this.fetchDataFromTemplateList(subCategoryId, (isDataEmpty: boolean) => {
      if (isDataEmpty) {
        this.templatelist = [];
        this.dataMessage = "* no more data available ";
      }
    });
  }

  fetchAffidavitTypes() {
    this.dataService.getAffidavitTypes(this.userType).subscribe(
      (data:SubCategoryList) => {
        this.subCategoryList = data.data;
        this.subCategoryList.unshift({ templateSubCategoryId: 0, templateSubCategoryName: 'All' } as SubCategory);
        this.loadingService.stopLoading();
      },
      (error) => {
        this.loadingService.stopLoading();
        console.error('Error fetching affidavit types:', error);
      }
    );
  }

  handleSize(event: any) {
    this.mybreakpoint = (window.innerWidth > 1024) ? 3 : (window.innerWidth > 600) ? 2 : 1;
  }

  fetchDataFromTemplateList(subCategoryId: number, onComplete: (isDataEmpty: boolean) => void) {
    const fetchMethod = this.dataService.fetchTemplateTrimmedList(this.userType, subCategoryId, this.page, this.PAGE_SIZE, this.filtervalue);
  
    fetchMethod.subscribe(
      (data: string) => {
        this.templatelist = [];
        const dataobj: NewTemplateListResponse = { ...JSON.parse(JSON.stringify(data)) };
        this.totalPages = dataobj.total;
  
        if (dataobj.success === true) {
          for (let i = 0; i < dataobj.data.length; i++) {
            const tempelement: TableRows = { serialno: i + 1, ...dataobj.data[i] };
            if (tempelement.publishedTemplateVersion != null && tempelement.publishedTemplateVersion != undefined) {
              this.templatelist.push(tempelement);
            }
          }
  
          this.processTemplateList(); 
          this.updatePaginationFlags();
         
          const isDataEmpty = dataobj.data.length === 0;
          onComplete(isDataEmpty); 
        } else {
          this.dataMessage = "* no more data available"; 
          onComplete(true); 
        }
        this.loadingService.stopLoading();
      },
      () => {
        
        this.page--; 
        this.dataMessage = "* no more data available"; 
        this.nextflag = true; 
        onComplete(true); 
      }
    );
  }

  updatePaginationFlags() {
    this.prevflag = this.page === 0;  // Disable previous button on first page
    this.nextflag = this.page >= this.totalPages - 1;  // Disable next button on last page
  }

  processTemplateList() {
    if (this.templatelist != undefined && this.templatelist != null && this.templatelist.length != 0) {
      this.templatelist = [...this.templatelist];
      for (const template of this.templatelist) {
        let templateid = template.templateId;
        this.dataInitialization(templateid);
      }
     
    } else {
      this.templatelist = [];
    }
  }

  dataInitialization(templateid) {

    this.userdataservice.fetchTemplateObjectById(templateid).subscribe(data => {

      if (data["success"] === true ) {
        let selectedTemplateobj = data["data"];
        let descriptionPageHtml = selectedTemplateobj.publishedTemplateVersion.templateVersionDescriptionHtml;
        setTimeout(() => {
          let node = document.createElement('div');
          this.templateHtmlSanitizer.replaceContent(
            node,
            selectedTemplateobj.publishedTemplateVersion.templateVersionValue +
            "<style>" + selectedTemplateobj.publishedTemplateVersion.templateVersionCss + "</style>"
          );
          node.style.width = "300px";
          node.style.height = "220px"
          node.style.display = "flex";
          node.style.flexFlow = "row wrap";
          node.style.fontSize = "8px";
          node.style.border = "0px";
          node.style.padding ="0px";
          node.style.justifyContent = "center";
          node.style.alignItems = "center";
          node.style.backgroundColor = "#00000014";
          node.style.marginTop= "1rem";
          node.style.borderRadius= "8px";
          let allspanarray = node.getElementsByTagName('span');
          for (let i = 0; i < allspanarray.length; i++) {
            allspanarray[i].style.fontSize = "8px";
            allspanarray[i].style.margin = "0px";
            allspanarray[i].style.padding = "0px";
          }
          let alldivarray = node.getElementsByTagName('div');
          for (let i = 0; i < alldivarray.length; i++) {
            alldivarray[i].style.border = "0px";
            alldivarray[i].style.margin = "0px";
            alldivarray[i].style.padding = "0px";
          }

          const signatureBoxes = node.getElementsByClassName('signature-box');
          for (let i = 0; i < signatureBoxes.length; i++) {
            (signatureBoxes[i] as HTMLElement).style.position = 'relative';
            alldivarray[i].style.margin = "0px";
            alldivarray[i].style.padding = "0px";
          }
          const paragraphclick = node.getElementsByClassName('paragraphclick');
          for (let i = 0; i < paragraphclick.length; i++) {
            const element = paragraphclick[i] as HTMLElement;
            element.style.paddingTop = '0px';
            element.style.paddingBottom = '0px';
            element.style.marginTop = '0px';
            element.style.marginBottom = '0px';
            element.style.minHeight = '0px'
          }

           const containerId = `affidavitcard-${templateid}`;
           const container = document.getElementById(containerId);
          //   "span[cust_tag]"

          if (container) {
            container.textContent = '';
            container.appendChild(node);
  
            let templatespanelementarray: NodeListOf<HTMLElement> = container.querySelectorAll("span[cust_tag]");
            for (let i = 0; i < templatespanelementarray.length; i++) {
              templatespanelementarray[i].innerText = "___________ ";
              templatespanelementarray[i].style.borderBottom = "0px";
            }
          } else {
            
          }
        }, 0)
      }
    }, () => {

    });
  }

  useTemplate(templateId) {
    this.router.navigate(['/user', 'affidavitdesc', templateId]);
  }

  previousPage() {
    if (this.page > 0) {
      this.page--; // Decrement the page index
      this.fetchDataFromTemplateList(this.selectedSubCategoryId, (isDataEmpty: boolean) => {
        if (isDataEmpty) {
          this.dataMessage = '* no more data available ';
        }
      });
    }
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++; // Increment the page index
      this.fetchDataFromTemplateList(this.selectedSubCategoryId, (isDataEmpty: boolean) => {
        if (isDataEmpty) {
          this.dataMessage = '* no more data available ';
        }
      });
    }
  }

  onhittingEnter(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.searchTemplates();
    }
  }

  searchTemplates() {
    this.page = 0;
    this.templatelist = [];
    this.fetchDataFromTemplateList(this.selectedSubCategoryId, (isDataEmpty: boolean) => {
      if (isDataEmpty) {
        this.dataMessage = "* no more data available "; 
      }
    });
  }

  openCaseRealtedDialog() {
        const dialogRef = this.dialog.open(CaseRelatedAffidavitsComponent, {
          disableClose: true,
          height: "44rem",
          width: "35rem",
          panelClass: 'custom-dialog-container',
          data: { },
        });

  }

}
