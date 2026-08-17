import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { TableRows } from 'src/app/shared/models/TableRows';
import { UserdataService } from '../userservices/userdata.service';
import { QuestionService } from 'src/app/admin/dashboard/manageTemplates/Templateservices/question.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { UserauthComponent } from '../user-auth/userauth-dialog/userauth.component';
import { UserAffidavitSaveRequest } from 'src/app/shared/models/UserAffidavitSaveRequest';
import { TemplateFinalViewComponent } from '../template-final-view/template-final-view.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { CustomFilenameDialogComponent } from '../custom-filename-dialog/custom-filename-dialog.component';
import { QuestionGroupDto } from 'src/app/shared/models/QuestionGroupDto';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import * as _moment from 'moment';
import { PriceSelectionDialogComponent } from '../price-selection-dialog/price-selection-dialog.component';
import { PdfService } from 'src/app/services/pdf.service';
import { AffidavitRecreationService } from 'src/app/services/affidavit-recreation.service';
import { TemplateRecreationPrefillService, UploadedPhoto } from './template-recreation-prefill.service';
import { TemplateHtmlSanitizerService } from 'src/app/shared/security/template-html-sanitizer.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({

  selector: 'app-fill-template',
  templateUrl: './fill-template.component.html',
  styleUrls: ['./fill-template.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class FillTemplateComponent implements OnInit {

  selectedTemplateobj = new TableRows();
  template: string = '';
  progress: number = 0;
  progresstyle = this.progress + '';
  questionlist = [];
  globalattributestates = {};
  currentgroupid = 0;
  previousgroupid = 0;
  groupIdarray: number[] = [];
  groupObjectarray: QuestionGroupDto[] = [];
  currentgroupindex = 0;
  arrayOfSpanElementInTemplate: HTMLElement[] = [];
  arrayOfParagraphElementInTemplate: HTMLElement[] = [];
  submitflag: boolean = false;
  groupsteps: number[] = [];
  paragraphConditionsList = [];
  userloggedInFlag = false;
  userloggedInObject;
  globaltemplateid;
  customaffidavitname;
  datestring;
  templateprice;
  backbuttonflag = false;
  defaultDate = new Date();
  deponentId: number;
  templateFastTrackPrice;
  recreationSourceAffidavitId: number;
  recreationContext: any;
  templateDefaultsReady = false;
  recreationPrefillApplied = false;
  recreationPhotoPrefillApplied = false;
  private recreatedTextPrefillAttributes = new Set<string>();

  constructor(private route: ActivatedRoute, private router: Router, private userdataservice: UserdataService,private pdfService: PdfService,
              private templatedataservice: QuestionService, public dialog: MatDialog,
              private affidavitRecreationService: AffidavitRecreationService,
              private templateRecreationPrefillService: TemplateRecreationPrefillService,
              private templateHtmlSanitizer: TemplateHtmlSanitizerService) {
  }

  ngOnInit() {
    let userSubscription: Subscription;
    userSubscription = this.route.params.subscribe(
      (params: Params) => {
        this.dataInitialization();
      });
  }

  dataInitialization() {
    this.groupIdarray = [];
    this.questionlist = [];
    this.groupObjectarray = [];
    this.groupsteps = [];
    this.globalattributestates = {};
    this.templateDefaultsReady = false;
    this.recreationPrefillApplied = false;
    this.recreationPhotoPrefillApplied = false;
    this.recreatedTextPrefillAttributes.clear();
    this.recreationSourceAffidavitId = this.route.snapshot.queryParams['recreateSourceAffidavitId']
      ? Number(this.route.snapshot.queryParams['recreateSourceAffidavitId'])
      : null;
    this.loadRecreationContext();

    if (!!localStorage.getItem('userdata') && localStorage.getItem('isAdmin') == 'false') {
      this.userloggedInFlag = true;
      this.userloggedInObject = JSON.parse(localStorage.getItem('userdata'));
    }

    const templateid = JSON.parse(this.route.snapshot.params['templateId']);
    this.globaltemplateid = templateid;

    if(this.route.snapshot.params['deponentId'] !== undefined && this.route.snapshot.params['deponentId'] !== null){
    const deponentId = JSON.parse(this.route.snapshot.params['deponentId']);
    this.deponentId = deponentId;
    }
    this.userdataservice.fetchTemplateObjectById(templateid).subscribe(data => {

      if (data['success'] === true) {
        this.selectedTemplateobj = data['data'];
        this.templateprice = this.selectedTemplateobj.templatePrice;
        this.templateFastTrackPrice= this.selectedTemplateobj.templateFastTrackPrice;
        let overridencss = '.row{padding:0px!important ; min-height:unset!important;}';

        this.template = this.templateHtmlSanitizer.sanitize(
          this.selectedTemplateobj.publishedTemplateVersion.templateVersionValue +
          '<style>' + this.selectedTemplateobj.publishedTemplateVersion.templateVersionCss + overridencss + '</style>'
        );
          
          this.template = this.preparePhotoUploadControls(this.template);

        const node = document.createElement('div');
        node.setAttribute('style', 'padding:5px 1rem;width:100%;');
        node.appendChild(this.templateHtmlSanitizer.sanitizeToFragment(this.template));
        const templateContainer = document.getElementById('templatecontainer');
        templateContainer.textContent = '';
        templateContainer.appendChild(node);
        this.template = node.innerHTML;
        this.initializeFileInputListeners();
        this.tryApplyRecreationPhotoPrefill();
        this.templatedataservice.getAllGroupTemplateQuestions(this.selectedTemplateobj.publishedTemplateVersion.templateVersionId)
        .subscribe((data) => {
          // sort groups acc to groupid
          data['data'].sort((a, b) => a['sequence'] < b['sequence'] ? -1 : a['sequence'] > b['sequence'] ? 1 : 0);

          for (let i = 0; i < data['data'].length; i++) {
            // create groupid array to navigate on groups using  next and back steps
            this.groupIdarray.push(data['data'][i]['questionGroupId']);

            const groupdtoboject = new QuestionGroupDto();
            groupdtoboject.sequence = data['data'][i]['sequence'];
            groupdtoboject.groupId = data['data'][i]['questionGroupId'];
            this.groupObjectarray.push(groupdtoboject);

            // sort question according to sequence in group
            data['data'][i]['templateQuestionDtos'].sort((a, b) => a['sequence'] < b['sequence'] ? -1 : a['sequence'] > b['sequence'] ? 1 : 0);

            for (let j = 0; j < data['data'][i]['templateQuestionDtos'].length; j++) {
              this.questionlist.push({ 'visible': true, ...data['data'][i]['templateQuestionDtos'][j] });
            }
          }

      if (this.questionlist.length === 0){
        this.submitflag = true;
      }
          this.populatingData(this.selectedTemplateobj.publishedTemplateVersion.templateVersionId, true);
        }, () => {
          
          // show alert box
          this.openAlertDialogBox('Alert', 'This Template is not published by admin ', true).afterClosed()
          .subscribe(data => {
            
          }, () => {
            
          });
          // hide alert box
        });
      } else {
        // show alert box
        this.openAlertDialogBox('Alert', 'Data not available ', true).afterClosed()
        .subscribe((data) => {
          
        }, () => {
          
        });
        // hide alert box
      }
    }, () => {
      
    });
  }

  initializeFileInputListeners() {
    const uploadContainers = document.querySelectorAll('.upload-container') as NodeListOf<HTMLElement>;
    const fileInputs = document.querySelectorAll('input.user_photo_image_upload') as NodeListOf<HTMLInputElement>;

    uploadContainers.forEach(uploadContainer => {
      if (!uploadContainer.hasAttribute('data-click-listener-attached')) {
        uploadContainer.setAttribute('data-click-listener-attached', 'true');
        uploadContainer.addEventListener('click', (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (target && target.tagName && target.tagName.toLowerCase() === 'input') {
            return;
          }

          event.preventDefault();
          const fileInput = uploadContainer.querySelector('input.user_photo_image_upload') as HTMLInputElement;
          if (fileInput) {
            fileInput.click();
          }
        });

        uploadContainer.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const fileInput = uploadContainer.querySelector('input.user_photo_image_upload') as HTMLInputElement;
            if (fileInput) {
              fileInput.click();
            }
          }
        });
      }
    });

    fileInputs.forEach(fileInput => {
      if (!fileInput.hasAttribute('data-listener-attached')) {
        fileInput.setAttribute('data-listener-attached', 'true');
        fileInput.addEventListener('change', this.handleFileUpload.bind(this));
      }
    });
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 2 * 1024 * 1024; 
  
      if (!validTypes.includes(file.type)) {
        this.showAlert('Only JPEG, JPG, and PNG files are allowed.');
        input.value = '';
        return;
      }
  
      if (file.size > maxSize) {
        this.showAlert('The maximum file size for uploaded photos is 2MB.');
        input.value = '';
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.resizeImage(base64String, 110, 110).then(resizedBase64 => {
          const inputId = input.id.replace('user_image_upload_', '');
          this.updateTemplateWithBase64Image(resizedBase64, inputId);
          input.value = ''; 
        });
      };
      reader.readAsDataURL(file);
    }
  }

  showAlert(message: string) {
    this.openAlertDialogBox('Alert', message, true).afterClosed().subscribe(
      () => { },
      () => { }
    );
  }

  resizeImage(base64Str: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
  
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
  
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
  
        ctx.drawImage(img, 0, 0, width, height);
  
        resolve(canvas.toDataURL('image/jpeg', 1.0)); 
      };
      img.onerror = (err) => {
        reject(err);
      };
    });
  }

  updateTemplateWithBase64Image(base64String: string, inputId: string) {
    const parentElement = document.getElementById(`upload-container-${inputId}`);
    if (parentElement) {
      this.renderUploadedPhoto(parentElement, base64String, inputId);
    }else {
    }
  
    this.template = document.getElementById('templatecontainer').innerHTML;
  }

  private renderUploadedPhoto(parentElement: HTMLElement, base64String: string, inputId: string) {
    const newImgElement = document.createElement('img');
    newImgElement.src = base64String;
    newImgElement.className = 'uploaded-user-photo-image';
    newImgElement.id = `uploaded-image-${inputId}`;
    newImgElement.addEventListener('click', () => {
      const fileInput = document.getElementById(`user_image_upload_${inputId}`) as HTMLInputElement;
      if (fileInput) {
          fileInput.click();
      }
    });

    parentElement.textContent = '';
    parentElement.classList.add('photo-uploaded');
    parentElement.appendChild(newImgElement);

    const newFileInput = document.createElement('input');
    newFileInput.type = 'file';
    newFileInput.id = `user_image_upload_${inputId}`;
    newFileInput.className = 'user_photo_image_upload';
    newFileInput.style.display = 'none';
    newFileInput.accept = 'image/jpeg, image/jpg, image/png';
    newFileInput.addEventListener('change', this.handleFileUpload.bind(this));
    parentElement.appendChild(newFileInput);
  }

  private preparePhotoUploadControls(templateHtml: string): string {
    const templateElement = document.createElement('div');
    templateElement.appendChild(this.templateHtmlSanitizer.sanitizeToFragment(templateHtml));

    const photoPlaceholders = templateElement.querySelectorAll('img.user_photo_image') as NodeListOf<HTMLImageElement>;

    photoPlaceholders.forEach((photoPlaceholder, index) => {
      const uploadContainer = this.getPhotoUploadContainer(photoPlaceholder);

      if (!uploadContainer) {
        return;
      }

      const uniqueId = index + 1;
      uploadContainer.classList.add('upload-container');
      uploadContainer.id = `upload-container-${uniqueId}`;
      uploadContainer.setAttribute('tabindex', '0');
      uploadContainer.textContent = '';

      const uploadLabel = document.createElement('label');
      uploadLabel.htmlFor = `user_image_upload_${uniqueId}`;
      uploadLabel.className = 'upload-label';
      uploadLabel.textContent = 'Upload Photo';

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = `user_image_upload_${uniqueId}`;
      fileInput.className = 'user_photo_image_upload';
      fileInput.style.display = 'none';
      fileInput.accept = 'image/jpeg, image/jpg, image/png';

      uploadContainer.appendChild(uploadLabel);
      uploadContainer.appendChild(fileInput);
    });

    if (photoPlaceholders.length > 0) {
      const uploadStyles = document.createElement('style');
      uploadStyles.textContent = `
        .upload-container {
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px dashed #808080;
          cursor: pointer;
          overflow: hidden;
        }
        .upload-container:hover {
          border-color: #0056b3;
        }
        .upload-container.photo-uploaded {
          border: 0;
        }
        .upload-container.user-upload {
          width: 110px;
          height: 110px;
        }
        .upload-label {
          box-sizing: border-box;
          color: #007bff;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 4px;
          font-size: 14px;
          line-height: 1.2;
          text-align: center;
        }
        .upload-label:hover {
          color: #0056b3;
        }
        .uploaded-user-photo-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
        }
      `;
      templateElement.appendChild(uploadStyles);
    }

    return templateElement.innerHTML;
  }

  private getPhotoUploadContainer(photoPlaceholder: HTMLImageElement): HTMLElement | null {
    const knownContainer = photoPlaceholder.closest('.user-photo, .user-upload, [id^="user-upload-photo"]') as HTMLElement;

    if (knownContainer) {
      return knownContainer;
    }

    return photoPlaceholder.parentElement as HTMLElement;
  }

  populatingData(templateversionid, firsttimeflag) {

    if (firsttimeflag === true) {
      // set group to be shown 
      this.currentgroupid = this.groupIdarray[this.currentgroupindex];
      this.groupsteps.push(this.currentgroupid);
      this.progress = parseInt('' + ((this.groupIdarray.indexOf(this.currentgroupid) + 1) / (this.groupIdarray.length)) * 100, 10);
      if (Number.isNaN(this.progress) || this.progress == undefined) {
        this.progress = 0;
      }
      this.progresstyle = this.progress + '%';
      this.populateDataInGlobalattributeObjectAndTemplateSelectAndCheck(this.selectedTemplateobj.publishedTemplateVersion.templateVersionId);
      
    }
  }

  evaluateQuestionCondtions(currentgroupid): number {

    /**
     * Iterate on each and every question and if some condition evaluates to true find its groupid and make that group appear next
     * plus exclude all those questions which are already came up in previous groups
     */
    let nextvalidgroupid = -1;
    let finalresult = 1;
    let conditionoperatoryType = '';
    let counter = 0;
    this.questionlist.forEach(question => {

      // inside every question
      if (question['groupDto']['sequence'] > currentgroupid) {

        // check question should beloong to group whos groupid is greater than currentgroupid

        question['questionConditionDtos'].forEach(questioncondition => {

          // inside questionconditiondto
          let subconditionsevaluation = 1;
          let subconditionlastoperatortype = '';
          if (questioncondition['subconditionDtos'] != null && questioncondition['subconditionDtos'] != undefined) {

            questioncondition['subconditionDtos'].forEach(subcondition => {

              let singlesubconditionevaluation = 1;

              if (subcondition['operatorType'] == '==') {
                if (this.globalattributestates[subcondition['attribute']['attributeName']] == '' + subcondition['value']) {
                  singlesubconditionevaluation = 1;
                } else {
                  singlesubconditionevaluation = 0;
                }

              } else if (subcondition['operatorType'] == '!=') {
                if (this.globalattributestates[subcondition['attribute']['attributeName']] != '' + subcondition['value']) {
                  singlesubconditionevaluation = 1;
                } else {
                  singlesubconditionevaluation = 0;
                }

              }

              // condition evaluation on the basis of conditionType
              if (subconditionlastoperatortype == '') {
                subconditionsevaluation = singlesubconditionevaluation;
                if (!!subcondition['conditionType']) {
                  subconditionlastoperatortype = subcondition['conditionType'];
                }
              } else {
                if (subconditionlastoperatortype == 'AND') {
                  subconditionsevaluation *= singlesubconditionevaluation;
                  if (!!subcondition['conditionType']) {
                    subconditionlastoperatortype = subcondition['conditionType'];
                  } else {
                    subconditionlastoperatortype = '';
                  }
                } else {
                  subconditionsevaluation += singlesubconditionevaluation;
                  if (!!subcondition['conditionType']) {
                    subconditionlastoperatortype = subcondition['conditionType'];
                  } else {
                    subconditionlastoperatortype = '';
                  }
                }

              }
            });

            // condition evaluation on the basis of conditionType
            if (conditionoperatoryType == '') {
              finalresult = subconditionsevaluation;
              if (!!questioncondition['conditionType']) {
                conditionoperatoryType = questioncondition['conditionType'];
              }
            } else {
              if (conditionoperatoryType == 'AND') {
                finalresult *= subconditionsevaluation;
                if (!!questioncondition['conditionType']) {
                  conditionoperatoryType = questioncondition['conditionType'];
                } else {
                  conditionoperatoryType = '';
                }
              } else {
                finalresult += subconditionsevaluation;
                if (!!questioncondition['conditionType']) {
                  conditionoperatoryType = questioncondition['conditionType'];
                } else {
                  conditionoperatoryType = '';
                }
              }
            }

            if (finalresult >= 1) {
              question.visible = true;
            } else {
              question.visible = false;
            }

          } else {
            if (counter == 0) {
              nextvalidgroupid = question['groupDto']['groupId'];
              counter++;
            }
          }
        });

        if (finalresult >= 1 && counter == 0) {
          nextvalidgroupid = question['groupDto']['groupId'];
          counter++;
        }

      }
    });
    return nextvalidgroupid;

  }

  evaluateTemplateConditions(firsttime) {
    // when it comes for the first time
    if (firsttime === true) {

      // ---------------------------------------------------------------------------------------------------------------------//
      // fetch span elements to apply data filled in questions section and replace data in fields accordingly
      const templatespanelementarray: NodeListOf<HTMLElement> = document.querySelectorAll('span[cust_tag]');

      for (let i = 0; i < templatespanelementarray.length; i++) {

        const attributenameofthefield = templatespanelementarray[i]['attributes']['cust_tag'].value;
        const question = this.findQuestionWithAttributeName(attributenameofthefield);
        if (question === undefined || question['inputType'] === 'checkBox' || question['inputType'] === 'comboBox') {

          templatespanelementarray[i].innerText = '';
          templatespanelementarray[i].style.borderBottom = '0px';
          templatespanelementarray[i].addEventListener('mouseover', this.onmouserovertemplateField.bind(event));
          templatespanelementarray[i].addEventListener('mouseout', this.onmouserovertemplateField.bind(event));
          this.arrayOfSpanElementInTemplate.push(templatespanelementarray[i]);

        } else {
          templatespanelementarray[i].innerText = '___________';
          templatespanelementarray[i].style.borderBottom = '0px';
          templatespanelementarray[i].addEventListener('mouseover', this.onmouserovertemplateField.bind(event));
          templatespanelementarray[i].addEventListener('mouseout', this.onmouserovertemplateField.bind(event));
          this.arrayOfSpanElementInTemplate.push(templatespanelementarray[i]);
        }
      }

      // replace text according to default values of checkbox and combobox and radio buttons
      this.questionlist.forEach(question => {

          // question["attributeName"]
        if (question['inputType'] === 'checkBox') {

          for (let i = 0; i < question['questionOptionDto'].length; i++) {

            if (question['questionOptionDto'][i]['optionValue'] === 'Checked' && question['defaultValue'] === 'true') {

              for (let j = 0; j < question['questionOptionDto'][i]['questionOptionActionDto'].length; j++) {
                const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']);
                for (let k = 0; k < spanelementarray.length; k++) {
                  spanelementarray[k].style.backgroundColor = 'yellow';
                  spanelementarray[k].style.transition = '0.7s ease all';
                  setTimeout(() => { spanelementarray[k].style.backgroundColor = 'transparent'; }, 700);
                  spanelementarray[k].innerText = this.globalattributestates[question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']] + ' ';
                }
              }

            } else if (question['questionOptionDto'][i]['optionValue'] === 'Unchecked' && question['defaultValue'] === 'false') {

              for (let j = 0; j < question['questionOptionDto'][i]['questionOptionActionDto'].length; j++) {
                
                const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']);
                for (let k = 0; k < spanelementarray.length; k++) {
                  spanelementarray[k].style.backgroundColor = 'yellow';
                  spanelementarray[k].style.transition = '0.7s ease all';
                  setTimeout(() => { spanelementarray[k].style.backgroundColor = 'transparent'; }, 700);
                  spanelementarray[k].innerText = this.globalattributestates[question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']] + ' ';
                }
              }

            }
          }

        } else if (question['inputType'] === 'comboBox' || question['inputType'] === 'radio') {
          // replace text according to the default value of default selection
          question['questionOptionDto'].forEach(questionoptiondto => {
            if (questionoptiondto['optionValue'] === question['defaultValue']) {

              for (let i = 0; i < questionoptiondto['questionOptionActionDto'].length; i++) {

                const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(questionoptiondto['questionOptionActionDto'][i]['attribute']['attributeName']);
                for (let j = 0; j < spanelementarray.length; j++) {
                  spanelementarray[j].style.backgroundColor = 'yellow';
                  spanelementarray[j].style.transition = '0.7s ease all';
                  setTimeout(() => { spanelementarray[j].style.backgroundColor = 'transparent'; }, 700);
                  spanelementarray[j].innerText = this.globalattributestates[questionoptiondto['questionOptionActionDto'][i]['attribute']['attributeName']] + ' ';
                }
              }
            }

          });

        }
      });

      // ---------------------------------------------------------------------------------------------------------------------//
      // fetching paragraph elements to apply show and hide conditions on paragraphs 
      const templateparagraphelementarray: NodeListOf<HTMLElement> = document.querySelectorAll('div[cust_tag]');
      for (let i = 0; i < templateparagraphelementarray.length; i++) {

        if (templateparagraphelementarray[i]['attributes']['cust_tag'].value != 'hellopara') {
          this.arrayOfParagraphElementInTemplate.push(templateparagraphelementarray[i]);
        }

      }

      // Evaluate conditions according to paragraph conditions which paragraph to be shown or which should be hidden
      this.userdataservice.fetchAllConditionsForTemplate(this.selectedTemplateobj.publishedTemplateVersion.templateVersionId).subscribe(
        data => {
          if (data['success'] === true) {
            
            this.paragraphConditionsList = data['data'];
            
            for(let paracondi of this.paragraphConditionsList){
              paracondi.paragraphSubcondition.sort(this.dynamicSort());
            }
            
            this.evaluateTemplateConditions(false);
          }
        }, () => {
          
        });
    } else {

      // when it called after first evaluation 
      this.paragraphConditionsList.forEach(paragraphcondition => {

        let subconditionevaluation = 1;
        let lastconditionType = '';
        paragraphcondition['paragraphSubcondition'].forEach(paragraphsubcondition => {
          let singlesubconditionevaluation = 1;

          if (paragraphsubcondition['operatorType'] === '==') {
            if (this.globalattributestates[paragraphsubcondition['attribute']['attributeName']] === '' + paragraphsubcondition['value']) {
              singlesubconditionevaluation = 1;
            } else {
              singlesubconditionevaluation = 0;
            }

          } else if (paragraphsubcondition['operatorType'] === '!=') {
            if (this.globalattributestates[paragraphsubcondition['attribute']['attributeName']] != '' + paragraphsubcondition['value']) {
              singlesubconditionevaluation = 1;
            } else {
              singlesubconditionevaluation = 0;
            }

          }

          // condition evaluation on the basis of conditionType
          if (lastconditionType === '') {
            subconditionevaluation = singlesubconditionevaluation;
            if (paragraphsubcondition['conditionType'] != null && paragraphsubcondition['conditionType'] != undefined && paragraphsubcondition['conditionType'] != '') {
              lastconditionType = paragraphsubcondition['conditionType'];
            }
          } else {
            if (lastconditionType === 'AND') {
              subconditionevaluation *= singlesubconditionevaluation;
              if (paragraphsubcondition['conditionType'] != null && paragraphsubcondition['conditionType'] != undefined && paragraphsubcondition['conditionType'] != '') {
                lastconditionType = paragraphsubcondition['conditionType'];
              } else {
                lastconditionType = '';
              }
            } else {
              subconditionevaluation += singlesubconditionevaluation;
              if (paragraphsubcondition['conditionType'] != null && paragraphsubcondition['conditionType'] != undefined && paragraphsubcondition['conditionType'] != '') {
                lastconditionType = paragraphsubcondition['conditionType'];
              } else {
                lastconditionType = '';
              }
            }

          }

          if (subconditionevaluation > 0) {
            let cust_tagstrign = '<#para' + paragraphcondition['paragraphConditionId'] + '#>';

            for (let i = 0; i < this.arrayOfParagraphElementInTemplate.length; i++) {
              if (this.arrayOfParagraphElementInTemplate[i].attributes['cust_tag'].value === cust_tagstrign) {
                this.arrayOfParagraphElementInTemplate[i].style.display = 'flex';
                this.arrayOfParagraphElementInTemplate[i].style.backgroundColor = 'yellow';
                setTimeout(() => {
                  this.arrayOfParagraphElementInTemplate[i].style.transition = '0.7s ease all';
                  this.arrayOfParagraphElementInTemplate[i].style.backgroundColor = 'transparent';
                }
                  , 700);
              }
            }

          } else {

            let cust_tagstrign = '<#para' + paragraphcondition['paragraphConditionId'] + '#>';
            for (let i = 0; i < this.arrayOfParagraphElementInTemplate.length; i++) {
              if (this.arrayOfParagraphElementInTemplate[i].attributes['cust_tag'].value === cust_tagstrign) {
                this.arrayOfParagraphElementInTemplate[i].style.display = 'none';
              }
            }
          }
        });
      });
    }
  }

 dynamicSort() {
    return function(a, b) {
        return (a.paragraphSubconditionId < b.paragraphSubconditionId) ? -1 : (a.paragraphSubconditionId > b.paragraphSubconditionId) ? 1 : 0;
    }
  }

  populateDataInGlobalattributeObjectAndTemplateSelectAndCheck(versionid) {

    this.userdataservice.fetchListOfAllAttributes(versionid).subscribe(data => {

      if (data['success'] === true) {
        data['data'].forEach(attribute => {
          if (attribute['optionAttributeName'] === null) {
            this.globalattributestates[attribute['attributeName']] = attribute['defaultValue'];
          } else {
            if (attribute['attributeName'] === attribute['optionAttributeName']) {
              this.globalattributestates[attribute['attributeName']] = attribute['defaultValue'];
            } else {
              this.globalattributestates[attribute['optionAttributeName']] = attribute['value'];
            }
          }
        });
        this.evaluateTemplateConditions(true);
        this.templateDefaultsReady = true;
        this.tryApplyRecreationPrefill();
      }

    }, () => {
      
    });

  }

  // function to 2-way bind input value for text field 
  keyPressInput(event: any, attributenameofquestion) {
    event.target.style.color = 'black';
    const element: HTMLElement[] = this.getTemplateSpanElement(attributenameofquestion);

    let scrollcount = 0;
    for (let i = 0; i < element.length; i++) {

      if (element[i]['attributes']['cust_tag'].value === attributenameofquestion) {

        if (scrollcount == 0) {
          element[i].scrollIntoView({ behavior: 'smooth' });
          scrollcount++;
        }

        const keypressed = event.data;

        if (keypressed != 'F9' && keypressed != 'F10' && keypressed != 'F11' && keypressed != 'F12'
          && keypressed != 'F5' && keypressed != 'F6' && keypressed != 'F7' && keypressed != 'F8'
          && keypressed != 'F1' && keypressed != 'F2' && keypressed != 'F3' && keypressed != 'F4'
          && keypressed != 'ArrowRight' && keypressed != 'ArrowLeft' && keypressed != 'ArrowUp' && keypressed != 'ArrowDown'
          && keypressed != 'Delete' && keypressed != 'Enter' && keypressed != 'Escape' && keypressed != 'Tab' && keypressed != 'Backspace'
          && keypressed != 'Shift' && keypressed != 'Control' && keypressed != 'Alt' && keypressed != 'CapsLock'
          && keypressed != 'Meta' && keypressed != 'WakeUp'
          && keypressed != 'PageUp' && keypressed != 'PageDown' && keypressed != null
          && event.inputType != 'deleteWordBackward' && event.inputType != 'deleteContentBackward') {

          element[i].innerText = event.target.value;
          this.globalattributestates[attributenameofquestion] = element[i].innerText;

        } else if (event.inputType === 'deleteWordBackward') {

          element[i].innerText = '___________';
          event.target.value = '';
          this.globalattributestates[attributenameofquestion] = '';

        } else if (event.inputType === 'deleteContentBackward') {
          element[i].innerText = event.target.value;
          this.globalattributestates[attributenameofquestion] = element[i].innerText;

          if (element[i].innerText === '') {
            element[i].innerText = '___________';
          }
        }
      }
    }
  }

  // functions written for date input events start
  datechange(event, attributenameofquestion) {

    const element: HTMLElement[] = this.getTemplateSpanElement(
      attributenameofquestion
    );

    let scrollcount = 0;
    for (let i = 0; i < element.length; i++) {
      if (element[i]['attributes']['cust_tag'].value === attributenameofquestion) {

        if (scrollcount == 0) {
          element[i].scrollIntoView({ behavior: 'smooth' });
          scrollcount++;
        }
        if (event.value['_d'] === '') {
          element[i].innerText = '___________';
          this.globalattributestates[attributenameofquestion] = '';
        } else {

          let date = new Date(event.value['_d']);
          const time = date.getTime();
          date = new Date(time);
          
          let todaydate = '';

          if (date.getDate().toString().length == 1) {
            todaydate = '0' + date.getDate().toString();
          } else {
            todaydate = date.getDate().toString();
          }

          let currentmonth;
          if ((date.getMonth() + 1).toString().length == 1) {
            currentmonth = (date.getMonth() + 1);
            currentmonth = '0' + currentmonth;
          } else {
            currentmonth = (date.getMonth() + 1).toString();
          }
          element[i].innerText = (todaydate) + ' / ' + currentmonth + ' / ' + date.getFullYear();
          this.globalattributestates[attributenameofquestion] = element[i].innerText;
        }
      }
    }
  }

  // method to capture checkbox  value change event 
  checkBoxChange(event, attributename, question) {
    const checkedflag = event.target.checked;
    
    this.globalattributestates[attributename] = '' + checkedflag;

    // on toggle of checkbox show some text on the template 

    // step 1 set question attribute value to selected option and reflect value every where 
    // step 2 replace text in template according to selected options 
    // step 3 and hide all text replaced by default selected value of previously selected value 

    // removing mapping for all options checked or unchecked
    for (let i = 0; i < question['questionOptionDto'].length; i++) {
      for (let j = 0; j < question['questionOptionDto'][i]['questionOptionActionDto'].length; j++) {
        const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']);
        let scrollcount = 0;
        for (let k = 0; k < spanelementarray.length; k++) {
          spanelementarray[k].style.backgroundColor = 'transparent';
          spanelementarray[k].innerText = '';
          if (scrollcount == 0) {
            spanelementarray[k].scrollIntoView({ behavior: 'smooth' });
            scrollcount++;
          }
        }
      }
    }

    // set mapping for selected option
    for (let i = 0; i < question['questionOptionDto'].length; i++) {

      if (question['questionOptionDto'][i]['optionValue'] === 'Checked' && checkedflag === true) {

        for (let j = 0; j < question['questionOptionDto'][i]['questionOptionActionDto'].length; j++) {

          this.globalattributestates[question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']]
            = question['questionOptionDto'][i]['questionOptionActionDto'][j]['value'];

          const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']);
          let scrollcount = 0;
          for (let k = 0; k < spanelementarray.length; k++) {
            spanelementarray[k].style.backgroundColor = 'yellow';
            spanelementarray[k].style.transition = '0.7s ease all';
            setTimeout(() => { spanelementarray[k].style.backgroundColor = 'transparent'; }, 700);
            spanelementarray[k].innerText = this.globalattributestates[question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']] + ' ';
            if (scrollcount == 0) {
              spanelementarray[k].scrollIntoView({ behavior: 'smooth' });
              scrollcount++;
            }
          }
        }

      } else if (question['questionOptionDto'][i]['optionValue'] === 'Unchecked' && checkedflag === false) {

        for (let j = 0; j < question['questionOptionDto'][i]['questionOptionActionDto'].length; j++) {

          this.globalattributestates[question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']]
            = question['questionOptionDto'][i]['questionOptionActionDto'][j]['value'];

          const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']);
          let scrollcount = 0;
          for (let k = 0; k < spanelementarray.length; k++) {
            spanelementarray[k].style.backgroundColor = 'yellow';
            spanelementarray[k].style.transition = '0.7s ease all';
            setTimeout(() => { spanelementarray[k].style.backgroundColor = 'transparent'; }, 700);
            spanelementarray[k].innerText = this.globalattributestates[question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']] + ' ';
            if (scrollcount == 0) {
              spanelementarray[k].scrollIntoView({ behavior: 'smooth' });
              scrollcount++;
            }
          }
        }
      }
    }
    this.evaluateTemplateConditions(false);
  }

  // method to capture dropdown value change event
  dropdownValueChangeEvent(event, attributename, question) {
    const selectedindex = event.target.selectedIndex;

    // step 1 set question attribute value to selected option and reflect value every where 
    // step 2 replace text in template according to selected options 
    // step 3 and hide all text replaced by default selected value of previously selected value 

    // removing mapping for all options
    for (let i = 0; i < question['questionOptionDto'].length; i++) {
      for (let j = 0; j < question['questionOptionDto'][i]['questionOptionActionDto'].length; j++) {
        
        const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']);
        let scrollcount = 0;
        for (let k = 0; k < spanelementarray.length; k++) {
          spanelementarray[k].style.backgroundColor = 'transparent';
          spanelementarray[k].innerText = '';
          if (scrollcount == 0) {
            spanelementarray[k].scrollIntoView({ behavior: 'smooth' });
            scrollcount++;
          }
        }
      }
    }

    // set mapping for selected option
    for (let i = 0; i < question['questionOptionDto'][selectedindex]['questionOptionActionDto'].length; i++) {

      this.globalattributestates[question['questionOptionDto'][selectedindex]['questionOptionActionDto'][i]['attribute']['attributeName']]
        = question['questionOptionDto'][selectedindex]['questionOptionActionDto'][i]['value'];

      const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(question['questionOptionDto'][selectedindex]['questionOptionActionDto'][i]['attribute']['attributeName']);
      let scrollcount = 0;
      for (let j = 0; j < spanelementarray.length; j++) {
        spanelementarray[j].style.backgroundColor = 'yellow';
        spanelementarray[j].style.transition = '0.7s ease all';
        setTimeout(() => { spanelementarray[j].style.backgroundColor = 'transparent'; }, 700);
        spanelementarray[j].innerText = this.globalattributestates[question['questionOptionDto'][selectedindex]['questionOptionActionDto'][i]['attribute']['attributeName']] + ' ';
        if (scrollcount == 0) {
          spanelementarray[j].scrollIntoView({ behavior: 'smooth' });
          scrollcount++;
        }
      }
    }
    this.evaluateTemplateConditions(false);
  }

  // radion button value changes
  radioButtonChange(event, question) {
    const selectedoptionvalue = event.value;
    let selectedindex;

    for (let i = 0; i < question['questionOptionDto'].length; i++) {
      if (question['questionOptionDto'][i].optionValue == selectedoptionvalue) {
        selectedindex = i;
        break;
      }
    }
    // step 1 set question attribute value to selected option and reflect value every where 
    // step 2 replace text in template according to selected options 
    // step 3 and hide all text replaced by default selected value of previously selected value 

    // removing mapping for all options
    for (let i = 0; i < question['questionOptionDto'].length; i++) {
      for (let j = 0; j < question['questionOptionDto'][i]['questionOptionActionDto'].length; j++) {
        const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(question['questionOptionDto'][i]['questionOptionActionDto'][j]['attribute']['attributeName']);
        let scrollcount = 0;
        for (let k = 0; k < spanelementarray.length; k++) {
          spanelementarray[k].style.backgroundColor = 'transparent';
          spanelementarray[k].innerText = '';
          if (scrollcount == 0) {
            spanelementarray[k].scrollIntoView({ behavior: 'smooth' });
            scrollcount++;
          }
        }
      }
    }

    // set mapping for selected option
    for (let i = 0; i < question['questionOptionDto'][selectedindex]['questionOptionActionDto'].length; i++) {

      this.globalattributestates[question['questionOptionDto'][selectedindex]['questionOptionActionDto'][i]['attribute']['attributeName']]
        = question['questionOptionDto'][selectedindex]['questionOptionActionDto'][i]['value'];

      const spanelementarray: HTMLElement[] = this.getTemplateSpanElement(question['questionOptionDto'][selectedindex]['questionOptionActionDto'][i]['attribute']['attributeName']);
      let scrollcount = 0;
      for (let j = 0; j < spanelementarray.length; j++) {
        spanelementarray[j].style.backgroundColor = 'yellow';
        spanelementarray[j].style.transition = '0.7s ease all';
        setTimeout(() => { spanelementarray[j].style.backgroundColor = 'transparent'; }, 700);
        spanelementarray[j].innerText = this.globalattributestates[question['questionOptionDto'][selectedindex]['questionOptionActionDto'][i]['attribute']['attributeName']] + ' ';
        if (scrollcount == 0) {
          spanelementarray[j].scrollIntoView({ behavior: 'smooth' });
          scrollcount++;
        }
      }
    }

    this.evaluateTemplateConditions(false);
  }

  // fucntions written for highlighting fields and questions
  highlightFieldInTemplateOnMouseoverQuestion(event, attributenameofquestion, flag) {

    if (flag === true) {
      const element: HTMLElement[] = this.getTemplateSpanElement(attributenameofquestion);

      for (let i = 0; i < element.length; i++) {
        element[i].style.backgroundColor = 'yellow';
      }
    } else if (flag === false) {
      const element: HTMLElement[] = this.getTemplateSpanElement(
        attributenameofquestion
      );

      for (let i = 0; i < element.length; i++) {
        if (element[i]['attributes']['cust_tag'].value === attributenameofquestion) {
          element[i].style.backgroundColor = 'transparent';
        }
      }
    }
  }

  onmouserovertemplateField = (event) => {
    const attributename = event.target['attributes']['cust_tag'].value;

    if (event.type === 'mouseover') {
      const questionhtmlelement = this.getQuestionElementFromQuestion(attributename, true);
      if (questionhtmlelement != undefined && questionhtmlelement != null) {
        questionhtmlelement.style.backgroundColor = 'yellow';
      }

    } else if (event.type === 'mouseout') {
      event.target.style.backgroundColor = 'transparent';
      const questionhtmlelement = this.getQuestionElementFromQuestion(attributename, false);
      if (questionhtmlelement != undefined && questionhtmlelement != null) {
        questionhtmlelement.style.backgroundColor = 'white';
      }
    }
  }

  findQuestionWithAttributeName(attributenameofthefield) {
    let questions;
    for (let i = 0; i < this.questionlist.length; i++) {
      if (this.questionlist[i]['attributeDto']['attributeName'] === attributenameofthefield) {
        questions = this.questionlist[i];
      }
    }
    return questions;
  }

  // Utility methods for getting template field html element
  getTemplateSpanElement(attributename) {
    const templatehtmlelement: HTMLElement[] = [];

    this.arrayOfSpanElementInTemplate.forEach((element: HTMLElement) => {
      if (element['attributes']['cust_tag'].value === attributename) {
        templatehtmlelement.push(element);
      }
    });

    return templatehtmlelement;
  }

  // Utility methods for getting question section question html element
  getQuestionElementFromQuestion(attributename, flag) {
    const questioelementarray: any = document.getElementsByClassName(attributename);
    if (questioelementarray.length > 0) {
      return questioelementarray[0];
    }

  }

  next() {
    // evaluate condition for next set of questions or next group to open
    let newgroup;
    this.groupObjectarray.forEach(groupobj => {
      if (groupobj.groupId == this.currentgroupid) {
        newgroup = this.evaluateQuestionCondtions(groupobj.sequence);
      }

    });

    if (newgroup != -1) {
      this.previousgroupid = this.currentgroupid;
      this.currentgroupid = newgroup;
      this.groupsteps.push(this.currentgroupid);
      this.progress = parseInt('' + ((this.groupIdarray.indexOf(this.currentgroupid) + 1) / (this.groupIdarray.length)) * 100, 10);
      this.progresstyle = this.progress + '%';

    } else {
      this.progress = 100;
      this.progresstyle = this.progress + '%';
    }

    if (this.progress === 100) {
      this.submitflag = true;
    }
    this.backbuttonflag = true;
  }

  back() {
    this.submitflag = false;
    if (this.groupsteps.length > 1) {
      this.groupsteps.pop();
      this.currentgroupid = this.groupsteps[this.groupsteps.length - 1];
    }

    if (this.groupsteps.length <= 1) {
      this.backbuttonflag = false;
    }

    this.progress = parseInt('' + ((this.groupIdarray.indexOf(this.currentgroupid) + 1) / (this.groupIdarray.length)) * 100, 10);
    this.progresstyle = this.progress + '%';
  }

  checkAllPhotosUploaded(): boolean {
    const fileInputs = document.querySelectorAll('input.user_photo_image_upload') as NodeListOf<HTMLInputElement>;
    let allUploaded = true;

    fileInputs.forEach(fileInput => {
        const uploadContainer = fileInput.closest('.upload-container');
        if (uploadContainer) {
            const uploadedImage = uploadContainer.querySelector('img.uploaded-user-photo-image');
            if (!uploadedImage) {
                allUploaded = false;
            }
        } else {
            allUploaded = false; 
        }
    });

    return allUploaded;
}
  purchase() {
    if (!this.checkAllPhotosUploaded()) {
      this.showAlert('Please upload all required images before proceeding.');
      return;
    }

    this.progress = 100;
    this.progresstyle = this.progress + '%';

    if (this.isRecreationMode()) {
      this.startRecreatedTemplateSave();
      return;
    }

    if (this.userloggedInFlag == false) {

      this.saveAndContinue(false);

    } else {

      let customaffidavitname = '';
      let isExpress = false;
      this.openPriceSelectionDialog(this.selectedTemplateobj.templatePrice, this.selectedTemplateobj.templateFastTrackPrice)
      .afterClosed().subscribe(priceData => {
          if (priceData === 'close' || !priceData) {
              return;
          }
          
          isExpress = priceData.isExpress;

      // open one more dialog to take input of filename from user
      this.openDialogToTakeAffidavitNameInput().afterClosed().subscribe(data => {
        if (data == 'close') {
          return;
        }
        
        customaffidavitname = data;
        // save the template data and then go for purchase page
        const message = 'Do you want to purchase ' + ((!customaffidavitname) ? this.selectedTemplateobj.templateName:customaffidavitname) + ' template ?';
        this.openAlertDialogBox('Purchase Template', message, false).afterClosed()
        .subscribe(data => {
          if (data == 'Yes') {
            const userAffidavit = new UserAffidavitSaveRequest();
            userAffidavit.userAffidavitId = 0;
            userAffidavit.templateVersionId = this.selectedTemplateobj.publishedTemplateVersion.templateVersionId;
            userAffidavit.userId = JSON.parse(localStorage.getItem('userdata'))['userId'];
            userAffidavit.attributeValueList = JSON.stringify(this.globalattributestates);
            userAffidavit.attributeValueList = userAffidavit.attributeValueList.replace(/"/g, '\'');
            userAffidavit.htmlValue = JSON.stringify(document.getElementById('templatecontainer').innerHTML);
            userAffidavit.groupStepsArray = JSON.stringify(this.groupsteps);
            userAffidavit.status = 'Pending';
            userAffidavit.userAffidavitCustomName = customaffidavitname;
            userAffidavit.isExpress=isExpress;
            this.customaffidavitname = customaffidavitname;
            if(this.deponentId !== null || this.deponentId !== undefined){
              userAffidavit.deponentId = this.deponentId;
            }
            this.userdataservice.saveAffidavitDataForUser(userAffidavit).subscribe((response: any) => {
              const userAffidavitData = response.data;
              this.openFinalPreview(JSON.parse(userAffidavit.htmlValue), userAffidavitData.userAffidavitId, false,userAffidavitData.isExpress);
            }, () => {
              this.openAlertDialogBox('Affidavit Save Failure', 'Something went wrong while saving your affidavit', true);
              
            });
          }
        });
      });
    });
    }
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

  // functions written for input events start
  focusonInput(event, value, attributename) {
    if (this.recreatedTextPrefillAttributes.has(attributename)) {
      return;
    }
    if (event.target.value === value) {
      event.target.value = '';
    }
  }

  focusoutInputa(event, values, attributename) {

    if (this.recreatedTextPrefillAttributes.has(attributename)) {
      return;
    }
    if (event.target.value === '') {
      event.target.value = values;
      event.target.style.color = 'grey';
    }

  }

  // saving template to fill later 
  async saveAndContinue(saveandcontinueflag) {
    if (!this.checkAllPhotosUploaded()) {
      this.showAlert('Please upload all required images before proceeding.');
      return;
    }
  
    if (!!localStorage.getItem('userdata') && (JSON.parse(localStorage.getItem('userdata'))['roleId'] == 2)) {
      this.userloggedInFlag = true;
      this.userloggedInObject = JSON.parse(localStorage.getItem('userdata'));
    } else {
      this.userloggedInFlag = false;
      this.userloggedInObject = null;
    }
  
    if (this.userloggedInFlag == false) {
      const dialogref = this.dialog.open(UserauthComponent);
      dialogref.afterClosed().subscribe(data => {
        if (data == 'Success') {
          if (!!localStorage.getItem('userdata')) {
            this.userloggedInFlag = true;
            this.userloggedInObject = JSON.parse(localStorage.getItem('userdata'));
          }
        }
      });
    } else if (this.userloggedInFlag == true) {
      let customaffidavitnametemp = '';
  
      this.openDialogToTakeAffidavitNameInput().afterClosed().subscribe(data => {
        if (data == 'close') {
          return;
        }
  
        customaffidavitnametemp = data;
  
        this.openAlertDialogBox('See you soon !', 'Do you want to save your progress and come back later ?', false).afterClosed()
          .subscribe((comeBackLater) => {
            if (comeBackLater === 'Yes') {
              const userAffidavit = new UserAffidavitSaveRequest();
              userAffidavit.userAffidavitId = 0;
              userAffidavit.templateVersionId = this.selectedTemplateobj.publishedTemplateVersion.templateVersionId;
              userAffidavit.userId = JSON.parse(localStorage.getItem('userdata'))['userId'];
              userAffidavit.attributeValueList = JSON.stringify(this.globalattributestates);
              userAffidavit.attributeValueList = '' + userAffidavit.attributeValueList.replace(/"/g, '\'');
              userAffidavit.htmlValue = JSON.stringify(document.getElementById('templatecontainer').innerHTML);
              userAffidavit.groupStepsArray = JSON.stringify(this.groupsteps);
              userAffidavit.status = 'Pending';
              userAffidavit.userAffidavitCustomName = customaffidavitnametemp;
              userAffidavit.isExpress = false;
              if (this.deponentId !== null || this.deponentId !== undefined) {
                userAffidavit.deponentId = this.deponentId;
              }
              this.customaffidavitname = customaffidavitnametemp;
  
              this.userdataservice.saveAffidavitDataForUser(userAffidavit).subscribe(async (response: any) => {
                const userAffidavitResponse = response.data;
  
                // Await the promise and get the dialogRef
                const dialogRef = await this.openFinalPreview(
                  JSON.parse(userAffidavit.htmlValue),
                  userAffidavitResponse.userAffidavitId,
                  true,
                  userAffidavitResponse.isExpress
                );
                // Now call afterClosed() on dialogRef
                dialogRef.afterClosed().subscribe((userResponse) => {
                  if (userResponse === 'Yes') {
                    localStorage.setItem("message", "Pending");
                    if (userAffidavitResponse.deponentId === null) {
                      this.router.navigate(['/user', 'myaccount', 'documents']);
                    } else {
                      this.router.navigate(['/user', 'myaccount', 'agent', 'documents']);
                    }
                  }
                });
              }, () => {
                this.openAlertDialogBox('Affidavit Save Failure', 'Something went wrong while saving your affidavit', true);
              });
            }
          });
      });
    }
  }

  openDialogToTakeAffidavitNameInput() {
    const dialogref = this.dialog.open(CustomFilenameDialogComponent, {
      data: { affidavitname: this.customaffidavitname }
    });
    return dialogref;
  }

  openAlertDialogBox(actionname: string, message: string, onlyclose: boolean): MatDialogRef<AlertdialogComponent> {
    const dialogref = this.dialog.open(AlertdialogComponent, {
      data: { actionname, message, onlyclose }
    });
    return dialogref;
  }

  private loadRecreationContext() {
    this.recreationContext = null;
    if (!this.recreationSourceAffidavitId) {
      return;
    }
    this.affidavitRecreationService.getContext(this.recreationSourceAffidavitId).subscribe((response: any) => {
      if (response && response.success === true && response.data && response.data.canRecreate === true) {
        this.recreationContext = response.data;
        if (this.recreationContext.userAffidavitCustomName) {
          this.customaffidavitname = this.recreationContext.userAffidavitCustomName;
        }
        this.tryApplyRecreationPrefill();
        this.tryApplyRecreationPhotoPrefill();
      } else {
        this.openAlertDialogBox('Recreate Affidavit', 'This affidavit can no longer be recreated.', true);
      }
    }, () => {
      this.openAlertDialogBox('Recreate Affidavit', 'This affidavit can no longer be recreated.', true);
    });
  }

  private tryApplyRecreationPrefill() {
    if (!this.isRecreationMode() || !this.recreationContext || !this.templateDefaultsReady || this.recreationPrefillApplied) {
      return;
    }
    const parsedValues = this.templateRecreationPrefillService
      .parseAttributeValues(this.recreationContext.attributeValueList);
    const filteredValues = this.templateRecreationPrefillService
      .filterKnownValues(parsedValues, this.questionlist, this.recreationContext.sourceHtmlValue);
    Object.keys(filteredValues).forEach(attributeName => {
      this.globalattributestates[attributeName] = filteredValues[attributeName];
      this.applyPrefillToQuestion(attributeName, filteredValues[attributeName]);
      this.applyPrefillToTemplate(attributeName, filteredValues[attributeName]);
    });
    this.recreationPrefillApplied = true;
    this.template = document.getElementById('templatecontainer').innerHTML;
    this.evaluateTemplateConditions(false);
    setTimeout(() => {
      Object.keys(filteredValues).forEach(attributeName => {
        this.applyPrefillToRenderedControl(attributeName, filteredValues[attributeName]);
      });
    });
  }

  private tryApplyRecreationPhotoPrefill() {
    if (!this.isRecreationMode() || !this.recreationContext || this.recreationPhotoPrefillApplied) {
      return;
    }
    const photos = this.templateRecreationPrefillService
      .extractUploadedPhotos(this.recreationContext.sourceHtmlValue);
    if (photos.length === 0) {
      this.recreationPhotoPrefillApplied = true;
      return;
    }
    const uploadContainers = document.querySelectorAll('#templatecontainer .upload-container') as NodeListOf<HTMLElement>;
    if (uploadContainers.length === 0) {
      return;
    }
    const slots: { container: HTMLElement, slotId: string, taken: boolean }[] = [];
    for (let i = 0; i < uploadContainers.length; i++) {
      const fileInput = uploadContainers[i].querySelector('input.user_photo_image_upload') as HTMLInputElement;
      const slotId = fileInput && fileInput.id ? fileInput.id.replace('user_image_upload_', '') : '' + (i + 1);
      slots.push({ container: uploadContainers[i], slotId: slotId, taken: false });
    }
    // Restore each photo into its original slot; fall back to document order only for
    // photos saved before slots carried an id.
    const unmatchedPhotos: UploadedPhoto[] = [];
    photos.forEach(photo => {
      const slot = photo.slotId === null
        ? undefined
        : slots.find(candidate => candidate.slotId === photo.slotId && !candidate.taken);
      if (slot) {
        slot.taken = true;
        this.renderUploadedPhoto(slot.container, photo.source, slot.slotId);
      } else {
        unmatchedPhotos.push(photo);
      }
    });
    unmatchedPhotos.forEach(photo => {
      const slot = slots.find(candidate => !candidate.taken);
      if (!slot) {
        return;
      }
      slot.taken = true;
      this.renderUploadedPhoto(slot.container, photo.source, slot.slotId);
    });
    this.recreationPhotoPrefillApplied = true;
    this.template = document.getElementById('templatecontainer').innerHTML;
  }

  private applyPrefillToQuestion(attributeName: string, value: any) {
    this.questionlist.forEach(question => {
      if (question && question.attributeDto && question.attributeDto.attributeName === attributeName) {
        question.defaultValue = value;
        if (question.inputType === 'textfield') {
          this.recreatedTextPrefillAttributes.add(attributeName);
        }
      }
    });
  }

  private applyPrefillToTemplate(attributeName: string, value: any) {
    const elements: HTMLElement[] = this.getTemplateSpanElement(attributeName);
    for (let i = 0; i < elements.length; i++) {
      elements[i].innerText = value === null || value === undefined || value === '' ? '___________' : value + ' ';
    }
  }

  private applyPrefillToRenderedControl(attributeName: string, value: any) {
    const containers = document.getElementsByClassName(attributeName);
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i] as HTMLElement;
      const textControl = container.querySelector('textarea, input.datepicker-input') as HTMLInputElement;
      if (textControl) {
        textControl.value = value === null || value === undefined ? '' : value;
        if (this.recreatedTextPrefillAttributes.has(attributeName)) {
          textControl.style.color = 'black';
        }
      }
      const selectControl = container.querySelector('select') as HTMLSelectElement;
      if (selectControl) {
        selectControl.value = value === null || value === undefined ? '' : value;
      }
      const checkboxControl = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkboxControl) {
        checkboxControl.checked = value === true || value === 'true';
      }
    }
  }

  private startRecreatedTemplateSave() {
    if (!this.recreationContext) {
      this.openAlertDialogBox('Recreate Affidavit', 'This affidavit can no longer be recreated.', true);
      return;
    }
    this.openDialogToTakeAffidavitNameInput().afterClosed().subscribe(data => {
      if (data === 'close') {
        return;
      }
      if (data && data.trim()) {
        this.customaffidavitname = data.trim();
      }
      this.saveRecreatedTemplate();
    });
  }

  private saveRecreatedTemplate() {
    if (!this.recreationContext) {
      this.openAlertDialogBox('Recreate Affidavit', 'This affidavit can no longer be recreated.', true);
      return;
    }
    const attributeValueList = JSON.stringify(this.globalattributestates).replace(/"/g, '\'');
    const request = {
      sourceAffidavitId: this.recreationContext.sourceAffidavitId,
      attributeValueList: attributeValueList,
      htmlValue: JSON.stringify(document.getElementById('templatecontainer').innerHTML),
      groupStepsArray: JSON.stringify(this.groupsteps),
      userAffidavitCustomName: this.customaffidavitname || this.recreationContext.userAffidavitCustomName
    };
    this.affidavitRecreationService.recreateTemplate(request).subscribe((response: any) => {
      if (response && response.success === true) {
        localStorage.setItem('message', 'Verified');
        if (this.recreationContext.deponentId === null || this.recreationContext.deponentId === undefined) {
          this.router.navigate(['/user', 'myaccount', 'documents', 'Verified']);
        } else {
          this.router.navigate(['/user', 'myaccount', 'agent', 'documents', 'Verified']);
        }
      } else {
        this.openAlertDialogBox('Recreate Affidavit',
          response && response.error ? response.error.message : 'Something went wrong while recreating your affidavit',
          true);
      }
    }, () => {
      this.openAlertDialogBox('Recreate Affidavit', 'Something went wrong while recreating your affidavit', true);
    });
  }

  isRecreationMode(): boolean {
    return !!this.recreationSourceAffidavitId;
  }

  openFinalPreview(templateValue, useraffidavitIdtemp, previewFlag, isExpress) {
    const tempprice = isExpress
      ? this.selectedTemplateobj.templateFastTrackPrice
      : this.templateprice;
  
    const customName =
      this.customaffidavitname && this.customaffidavitname.trim()
        ? this.customaffidavitname
        : this.selectedTemplateobj.templateName;
  
    const pdfFileName = `${customName || 'template'}.pdf`;
  
    return this.pdfService
      .previewPdf(templateValue, pdfFileName)
      .then((docUrl) => {
        const dialogRef = this.dialog.open(TemplateFinalViewComponent, {
          data: {
            templatevalue: templateValue,
            previewflag: previewFlag,
            templateId: this.globaltemplateid,
            useraffidavitId: useraffidavitIdtemp,
            templateName: this.selectedTemplateobj.templateName,
            templatecustomName: customName,
            price: tempprice,
            isExpress: isExpress,
            docUrl: docUrl
          },
        });
        // Return the dialogRef so that we can call afterClosed()
        return dialogRef; 
      })
      .catch((error) => {
        console.error('Fill template: failed to generate PDF preview', error);
        throw error;
      });
  }

}
