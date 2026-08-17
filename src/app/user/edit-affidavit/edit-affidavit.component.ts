import { Component, OnInit } from '@angular/core';
import { QuestionService } from 'src/app/admin/dashboard/manageTemplates/Templateservices/question.service';
import { UserdataService } from '../userservices/userdata.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../userservices/data.service';
import { UserAffidavitSaveRequest } from 'src/app/shared/models/UserAffidavitSaveRequest';
import { UserauthComponent } from '../user-auth/userauth-dialog/userauth.component';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { TemplateFinalViewComponent } from '../template-final-view/template-final-view.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { CustomFilenameDialogComponent } from '../custom-filename-dialog/custom-filename-dialog.component';
import { QuestionGroupDto } from 'src/app/shared/models/QuestionGroupDto';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import * as _moment from 'moment';
import { PriceSelectionDialogComponent } from '../price-selection-dialog/price-selection-dialog.component';
import { PdfService } from 'src/app/services/pdf.service';
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
  selector: 'app-edit-affidavit',
  templateUrl: './edit-affidavit.component.html',
  styleUrls: ['./edit-affidavit.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class EditAffidavitComponent implements OnInit {

  affidavitId;
  templateVersionId;
  templateprice;
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
  requestobj = new UserAffidavitSaveRequest();
  templatename;
  templatecustomname;
  backbuttonflag = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dataservice: DataService,
              private userdataservice: UserdataService,
              private templatedataservice: QuestionService,
              public dialog: MatDialog,
              private pdfService: PdfService,
              private templateHtmlSanitizer: TemplateHtmlSanitizerService) {

    this.templateVersionId = this.route.snapshot.params['templateId'];
    this.affidavitId = this.route.snapshot.params['affidavitId'];
    this.templateprice = this.route.snapshot.params['price'];
    this.templatename = this.route.snapshot.params['d'];
    this.templatecustomname = this.route.snapshot.params['cd'];

  }

  ngOnInit() {
    let userSubscription: Subscription;
    userSubscription = this.route.params.subscribe(
      (params: Params) => {
        this.dataInitialization()
      });
  }

  dataInitialization() {
    this.groupIdarray = [];
    this.questionlist = [];
    this.groupObjectarray = [];
    this.groupsteps = [];
    this.globalattributestates = {};
    this.requestobj = new UserAffidavitSaveRequest();

    if (!!localStorage.getItem('userdata') && localStorage.getItem('isAdmin') == 'false') {
      this.userloggedInFlag = true;
      this.userloggedInObject = JSON.parse(localStorage.getItem('userdata'));
    }

    this.userdataservice.fetchUserAffidavitData(this.affidavitId).subscribe(data => {
      if (data['success'] === true) {
        this.requestobj = data['data'];

        if(!!this.requestobj.templateName)
          this.templatename = this.requestobj.templateName;

        if (!!this.requestobj.userAffidavitCustomName) {
          this.templatecustomname = this.requestobj.userAffidavitCustomName;
        }
        this.template = this.templateHtmlSanitizer.sanitize(JSON.parse(this.requestobj.htmlValue));
        const node = document.createElement('div');
        node.appendChild(this.templateHtmlSanitizer.sanitizeToFragment(this.template));
        const templateContainer = document.getElementById('templatecontainer');
        templateContainer.textContent = '';
        templateContainer.appendChild(node);
        this.template = node.innerHTML;

        this.templatedataservice.getAllGroupTemplateQuestions(this.templateVersionId).subscribe(data => {
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
          this.populatingData(this.templateVersionId, true);
        }, () => {
            // show alert box
            this.openAlertDialogBox('Alert', 'This Template is not published by admin ', true).afterClosed()
            .subscribe((data) => {
              
            }, () => {
              
            });
        });
      } else {
        // show alert box
        this.openAlertDialogBox('Alert', 'Data not available ', true)
          .afterClosed()
          .subscribe(
            data => {
              
            },
            () => { }
          );
        // hide alert box
      }
    },
      () => {
        
      }
    );
  }

  populatingData(templateversionid, firsttimeflag) {

    this.groupsteps = JSON.parse(this.requestobj.groupStepsArray);
    
    if (this.groupsteps.length <= 1) {
      this.backbuttonflag = false;
    } else {
      this.backbuttonflag = true;
    }
    // set group to be shown 
    this.currentgroupid = this.groupsteps[this.groupsteps.length - 1];
    this.progress = parseInt('' + ((this.groupIdarray.indexOf(this.currentgroupid) + 1) / (this.groupIdarray.length)) * 100, 10);
    if (Number.isNaN(this.progress) || this.progress == undefined) {
      this.progress = 0;
    }
    this.progresstyle = this.progress + '%';
    // evaluate conditions for this group (what question should be shown and what are not )
    this.populateDataInGlobalattributeObjectAndTemplateSelectAndCheck(this.templateVersionId);
    this.groupObjectarray.forEach(groupobj => {
      if (groupobj.groupId == this.currentgroupid) {
        this.evaluateQuestionConditionsForCurrentGroupQuestionVisibility(groupobj.sequence);
      }

    });
    setTimeout(() => { this.populateDataInQuestionInputFileds(); }, 0);
  }

  // this method helps in finding out which question should be shown in this grooup
  evaluateQuestionConditionsForCurrentGroupQuestionVisibility(currentgroupid) {

    /**
     * iterate on each and every question and if some condition evaluates to true find its groupid and make that group appear next
     * plus exclude all those questions which are already came up in previous groups
     */
    let nextvalidgroupid = -1;
    let finalresult = 1;
    let conditionoperatoryType = '';
    let counter = 0;
    this.questionlist.forEach(question => {

      // inside every question
      if (question['groupDto']['sequence'] == currentgroupid) { // **IMP **basically currentgroupid is current groups sequence number 

        // check question should beloong to group whos groupid is greater than currentgroupid

        question['questionConditionDtos'].forEach(questioncondition => {

          // inside questionconditiondto
          let subconditionsevaluation = 1;
          let subconditionlastoperatortype = '';
          if (questioncondition['subconditionDtos'] != null && questioncondition['subconditionDtos'] != undefined) {

            questioncondition['subconditionDtos'].forEach(subcondition => {

              let singlesubconditionevaluation = 1;

              if (subcondition['operatorType'] == '==') {
                if (this.globalattributestates[subcondition['attribute']['attributeName']] === '' + subcondition['value']) {
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
                if (!!subcondition['conditionType'] != null) {
                  subconditionlastoperatortype = subcondition['conditionType'];
                }
              } else {
                if (subconditionlastoperatortype == 'AND') {
                  subconditionsevaluation *= singlesubconditionevaluation;
                  if (!!subcondition['conditionType'] != null) {
                    subconditionlastoperatortype = subcondition['conditionType'];
                  } else {
                    subconditionlastoperatortype = '';
                  }
                } else {
                  subconditionsevaluation += singlesubconditionevaluation;
                  if (!!subcondition['conditionType'] != null) {
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

  }

  evaluateQuestionConditions(currentgroupid): number {

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
          if (!!questioncondition['subconditionDtos']) {

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

          templatespanelementarray[i].addEventListener('mouseover', this.onmouserovertemplateField.bind(event));
          templatespanelementarray[i].addEventListener('mouseout', this.onmouserovertemplateField.bind(event));
          this.arrayOfSpanElementInTemplate.push(templatespanelementarray[i]);

        } else {
          templatespanelementarray[i].addEventListener('mouseover', this.onmouserovertemplateField.bind(event));
          templatespanelementarray[i].addEventListener('mouseout', this.onmouserovertemplateField.bind(event));
          this.arrayOfSpanElementInTemplate.push(templatespanelementarray[i]);
        }
      }

      // ---------------------------------------------------------------------------------------------------------------------// 
      // fetching paragraph elements to apply show and hide conditions on paragraphs 

      const templateparagraphelementarray: NodeListOf<HTMLElement> = document.querySelectorAll('div[cust_tag]');

      for (let i = 0; i < templateparagraphelementarray.length; i++) {

        if (templateparagraphelementarray[i]['attributes']['cust_tag'].value != 'hellopara') {
          this.arrayOfParagraphElementInTemplate.push(templateparagraphelementarray[i]);
        }

      }

      // evaluate conditions according to paragraph conditions which paragraph to be shown or which should be hidden
      this.userdataservice.fetchAllConditionsForTemplate(this.templateVersionId).subscribe(
        (response: any) => {
          if (response.success) {
            
            this.paragraphConditionsList = response.data;
            
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
            subconditionevaluation = singlesubconditionevaluation
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
    this.requestobj.attributeValueList = '' + this.requestobj.attributeValueList.replace(/'/g, '\"');
  //  Remove any double quotes within values
    const jsonString = this.requestobj.attributeValueList.replace(/:\s*("(.*?)"|'(.*?)')(?=[,\}])/g, (_, g1, g2, g3) => {
      return g2 ? `: "${g2.replace(/"/g, '')}"` : `: '${g3.replace(/'/g, '')}'`;
  });
   this.globalattributestates = JSON.parse(jsonString);
    this.evaluateTemplateConditions(true);
  }

  // function to 2-way bind input value for text field 
  keyPressInput(event: any, attributenameofquestion) {
    event.target.style.color = 'black';
    const element: HTMLElement[] = this.getTemplateSpanElement(attributenameofquestion);

    let scrollcount = 0
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
          && keypressed != 'PageUp' && keypressed != 'PageDown' && keypressed != null && event.inputType != 'deleteWordBackward'
          && event.inputType != 'deleteContentBackward') {

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
            element[i].innerText = '___________'
          };
        }
      }

    }
  }

  //  functions written for date input events start
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

        if (event.value['_d'] == '') {
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

          element[i].innerText = todaydate + ' / ' + (currentmonth) + ' / ' + date.getFullYear();
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

  // method called when radion button value changes 
  radioButtonChange(event, question) {
    const selectedoptionvalue = event.value;
    let selectedindex;

    for (let i = 0; i < question['questionOptionDto'].length; i++) {
      if (question['questionOptionDto'][i].optionValue == selectedoptionvalue) {
        selectedindex = i;
        break
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

  //  fucntions written for highlighting fields and questions

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
      if (questionhtmlelement != undefined && questionhtmlelement != null)
        questionhtmlelement.style.backgroundColor = 'yellow';

    } else if (event.type === 'mouseout') {
      event.target.style.backgroundColor = 'transparent';
      const questionhtmlelement = this.getQuestionElementFromQuestion(attributename, false);
      if (questionhtmlelement != undefined && questionhtmlelement != null)
        questionhtmlelement.style.backgroundColor = 'white';
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
    const templateHtmlElements: HTMLElement[] = [];
    this.arrayOfSpanElementInTemplate.forEach((element: HTMLElement) => {
      if (element['attributes']['cust_tag'].value === attributename) {
        templateHtmlElements.push(element);
      }
    });

    return templateHtmlElements;
  }

  // Utility methods for getting question section question html element
  getQuestionElementFromQuestion(attributename, flag) {
    const questionElements: any = document.getElementsByClassName(attributename);
    if (questionElements.length > 0) {
      return questionElements[0];
    }
  }

  next() {
    // evaluate condition for next set of questions or next group to open
    let newgroup;
    this.groupObjectarray.forEach(groupobj => {
      if (groupobj.groupId == this.currentgroupid) {
        newgroup = this.evaluateQuestionConditions(groupobj.sequence);
      }

    });

    if (newgroup != -1) {
      this.previousgroupid = this.currentgroupid;
      this.currentgroupid = newgroup;
      this.groupsteps.push(this.currentgroupid);
      this.progress = parseInt('' + ((this.groupIdarray.indexOf(this.currentgroupid) + 1) / (this.groupIdarray.length)) * 100, 10);
      this.progresstyle = this.progress + '%';
      this.populateDataInQuestionInputFileds();
    } else {
      this.progress = 100
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

    this.groupObjectarray.forEach(groupobj => {
      if (groupobj.groupId == this.currentgroupid) {
        this.evaluateQuestionConditionsForCurrentGroupQuestionVisibility(groupobj.sequence);
      }

    });

    this.populateDataInQuestionInputFileds();
    
  }

  purchase() {
    this.progress = 100;
    this.progresstyle = this.progress + '%';
    if (this.userloggedInFlag === false) {
      this.saveAndContinue(false);
    } else {
      // save the template data and then go for purchase page
      let customaffidavitname = '';
      let isExpress = false;
      this.openPriceSelectionDialog(this.requestobj.templatePrice, this.requestobj.templateFastTrackPrice)
      .afterClosed().subscribe(priceData => {
          if (priceData === 'close' || !priceData) {
              return;
          }
          
          isExpress = priceData.isExpress;
      if (!!this.requestobj.userAffidavitCustomName) {

        this.openAlertDialogBox('Purchase Template', 'Do you want to purchase this template ?', false).afterClosed().subscribe(data => {

          if (data === 'Yes') {

            const userAffidavit = new UserAffidavitSaveRequest();
            userAffidavit.userAffidavitId = this.requestobj.userAffidavitId;
            userAffidavit.templateVersionId = this.templateVersionId;
            userAffidavit.userId = JSON.parse(localStorage.getItem('userdata'))['userId'];
            userAffidavit.attributeValueList = JSON.stringify(this.globalattributestates);
            userAffidavit.attributeValueList = userAffidavit.attributeValueList.replace(/"/g, '\'');
            userAffidavit.htmlValue = JSON.stringify(document.getElementById('templatecontainer').innerHTML);
            userAffidavit.groupStepsArray = JSON.stringify(this.groupsteps);
            userAffidavit.status = 'Pending';
            userAffidavit.userAffidavitCustomName = this.requestobj.userAffidavitCustomName;
            userAffidavit.deponentId = this.requestobj.deponentId;
            userAffidavit.isExpress = isExpress;
            this.userdataservice.saveAffidavitDataForUser(userAffidavit).subscribe((response: any) => {
              const userAffidavitResponse = response.data;
              this.openFinalPreview(JSON.parse(userAffidavit.htmlValue), false,userAffidavitResponse.isExpress);
            }, () => {
              
              this.openAlertDialogBox('Affidavit Update Failure', 'Something went wrong while updating your affidavit', true);
            });
          }
        });

      } else {
        //  open one more dialog to take input of filename from user
        this.openDialogToTakeAffidavitNameInput().afterClosed().subscribe(data => {

          if (data == 'close') {
            return;
          }
         
          customaffidavitname = data;
          
          this.openAlertDialogBox('Purchase Template', 'Do you want to purchase this template ?', false).afterClosed().subscribe(data => {

            if (data === 'Yes') {

              const userAffidavit = new UserAffidavitSaveRequest();
              userAffidavit.userAffidavitId = this.requestobj.userAffidavitId;
              userAffidavit.templateVersionId = this.templateVersionId;
              userAffidavit.userId = JSON.parse(localStorage.getItem('userdata'))['userId'];
              userAffidavit.attributeValueList = JSON.stringify(this.globalattributestates);
              userAffidavit.attributeValueList = userAffidavit.attributeValueList.replace(/"/g, '\'');
              userAffidavit.htmlValue = JSON.stringify(document.getElementById('templatecontainer').innerHTML);
              userAffidavit.groupStepsArray = JSON.stringify(this.groupsteps);
              userAffidavit.status = 'Pending';
              userAffidavit.userAffidavitCustomName = customaffidavitname;
              this.requestobj.userAffidavitCustomName = customaffidavitname;
              userAffidavit.deponentId = this.requestobj.deponentId;
              userAffidavit.isExpress = isExpress;
              this.userdataservice.saveAffidavitDataForUser(userAffidavit).subscribe((response: any) => {
                const userAffidavitResponse = response.data;
                this.openFinalPreview(JSON.parse(userAffidavit.htmlValue), false,userAffidavitResponse.isExpress);
              }, () => {
                
                this.openAlertDialogBox('Affidavit Update Failure', 'Something went wrong while updating your affidavit', true);
              });
            }
          });
        });
      }
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
    if (event.target.value === value) {
      event.target.value = '';
    }
  }

  focusoutInputa(event, values, attributename) {

    if (event.target.value === '') {
      event.target.value = values;
      event.target.style.color = 'grey';
    }
  }
  //       // open one more dialog to take input of filename from user
  //   // if user is not logged in open a popup box for login
  // Saving template to fill later

  async saveAndContinue(saveandcontinueflag) {
    if (!!localStorage.getItem('userdata') && (JSON.parse(localStorage.getItem('userdata'))['roleId'] == 2)) {
      this.userloggedInFlag = true;
      this.userloggedInObject = JSON.parse(localStorage.getItem('userdata'));
    } else {
      this.userloggedInFlag = false;
      this.userloggedInObject = null;
    }
  
    // If user is not logged in, open a popup box for login
    if (this.userloggedInFlag === false) {
      const dialogref = this.dialog.open(UserauthComponent);
      dialogref.afterClosed().subscribe(data => {
        if (data === 'Success') {
          if (!!localStorage.getItem('userdata')) {
            this.userloggedInFlag = true;
            this.userloggedInObject = JSON.parse(localStorage.getItem('userdata'));
          }
        }
      });
    } else if (this.userloggedInFlag === true) {
      let customaffidavitname = '';
  
      if (!!this.requestobj.userAffidavitCustomName) {
        const comeBackLater = await this.openAlertDialogBox(
          'See you soon!',
          'Do you want to save your progress and come back later?',
          false
        ).afterClosed().toPromise();
  
        if (comeBackLater === 'Yes') {
          const userAffidavit = new UserAffidavitSaveRequest();
          userAffidavit.userAffidavitId = this.requestobj.userAffidavitId;
          userAffidavit.templateVersionId = this.templateVersionId;
          userAffidavit.userId = JSON.parse(localStorage.getItem('userdata'))['userId'];
          userAffidavit.attributeValueList = JSON.stringify(this.globalattributestates).replace(/"/g, "'");
          userAffidavit.htmlValue = JSON.stringify(document.getElementById('templatecontainer').innerHTML);
          userAffidavit.groupStepsArray = JSON.stringify(this.groupsteps);
          userAffidavit.status = 'Pending';
          userAffidavit.userAffidavitCustomName = this.requestobj.userAffidavitCustomName;
          userAffidavit.deponentId = this.requestobj.deponentId;
          userAffidavit.isExpress = this.requestobj.isExpress;
  
          try {
            const response: any = await this.userdataservice.saveAffidavitDataForUser(userAffidavit).toPromise();
            const userAffidavitResponse = response.data;
  
            const dialogRef = await this.openFinalPreview(
              JSON.parse(userAffidavit.htmlValue),
              true,
              userAffidavitResponse.isExpress
            );
  
            const userResponse = await dialogRef.afterClosed().toPromise();
  
            if (userResponse === 'Yes') {
              if (userAffidavitResponse.deponentId === null) {
                this.router.navigate(['/user', 'myaccount', 'documents']);
              } else {
                this.router.navigate(['/user', 'myaccount', 'agent', 'documents']);
              }
            }
          } catch (error) {
            this.openAlertDialogBox('Affidavit Update Failure', 'Something went wrong while updating your affidavit', true);
          }
        }
      } else {
        const data = await this.openDialogToTakeAffidavitNameInput().afterClosed().toPromise();
  
        if (data === 'close') {
          return;
        }
  
        customaffidavitname = data;
  
        const comeBackLater = await this.openAlertDialogBox(
          'See you soon!',
          'Do you want to save your progress and come back later?',
          false
        ).afterClosed().toPromise();
  
        if (comeBackLater === 'Yes') {
          const userAffidavit = new UserAffidavitSaveRequest();
          userAffidavit.userAffidavitId = this.requestobj.userAffidavitId;
          userAffidavit.templateVersionId = this.templateVersionId;
          userAffidavit.userId = JSON.parse(localStorage.getItem('userdata'))['userId'];
          userAffidavit.attributeValueList = JSON.stringify(this.globalattributestates).replace(/"/g, "'");
          userAffidavit.htmlValue = JSON.stringify(document.getElementById('templatecontainer').innerHTML);
          userAffidavit.groupStepsArray = JSON.stringify(this.groupsteps);
          userAffidavit.status = 'Pending';
          userAffidavit.userAffidavitCustomName = customaffidavitname;
          this.requestobj.userAffidavitCustomName = userAffidavit.userAffidavitCustomName;
          userAffidavit.isExpress = this.requestobj.isExpress;
          userAffidavit.deponentId = this.requestobj.deponentId;
  
          try {
            const response: any = await this.userdataservice.saveAffidavitDataForUser(userAffidavit).toPromise();
            const userAffidavitResponse = response.data;
  
            const dialogRef = await this.openFinalPreview(
              JSON.parse(userAffidavit.htmlValue),
              true,
              userAffidavitResponse.isExpress
            );
  
            const userResponse = await dialogRef.afterClosed().toPromise();
  
            if (userResponse === 'Yes') {
              if (userAffidavitResponse.deponentId === null) {
                this.router.navigate(['/user', 'myaccount', 'documents']);
              } else {
                this.router.navigate(['/user', 'myaccount', 'agent', 'documents']);
              }
            }
          } catch (error) {
            this.openAlertDialogBox('Affidavit Update Failure', 'Something went wrong while updating your affidavit', true);
          }
        }
      }
    }
  }

  openAlertDialogBox(actionname: string, message: string, onlyclose: boolean): MatDialogRef<AlertdialogComponent> {
    const dialogref = this.dialog.open(AlertdialogComponent, {
      data: { actionname, message, onlyclose }
    });
    return dialogref;
  }

  openDialogToTakeAffidavitNameInput() {
    const dialogref = this.dialog.open(CustomFilenameDialogComponent);
    return dialogref;
  }
  //       //  it should not be templateVersionId it should be tempalteId

  openFinalPreview(templateValue, previewFlag, isExpress) {
    const tempprice = isExpress
      ? this.requestobj.templateFastTrackPrice
      : this.templateprice;
  
    const customName =
    this.requestobj.userAffidavitCustomName && this.requestobj.userAffidavitCustomName.trim()
        ? this.requestobj.userAffidavitCustomName
        : this.requestobj.templateName;
  
    const pdfFileName = `${customName || 'template'}.pdf`;
  
    return this.pdfService
      .previewPdf(templateValue, pdfFileName)
      .then((docUrl) => {
        const dialogRef = this.dialog.open(TemplateFinalViewComponent, {
          data: {
            templatevalue: templateValue,
            previewflag: previewFlag,
            //  it should not be templateVersionId it should be tempalteId
            price: tempprice,
            useraffidavitId: this.requestobj.userAffidavitId,
            templateName: this.templatename,
            templatecustomName: this.requestobj.userAffidavitCustomName,
            isExpress:isExpress,
            docUrl: docUrl
          },
        });

        return dialogRef; 
      })
      .catch((error) => {
        throw error;
      });
  }

  populateDataInQuestionInputFileds() {
    this.questionlist.forEach(question => {

      if (question['groupDto']['groupId'] === this.currentgroupid) {
        if (question['inputType'] === 'textfield') {
          const questionelement: HTMLElement = this.getQuestionElementFromQuestion(question['attributeName'], false);
          questionelement.getElementsByTagName('textarea')[0].style.color = 'Black';
          questionelement.getElementsByTagName('textarea')[0].value = this.globalattributestates[question['attributeName']];

        } else if (question['inputType'] === 'checkBox') {

          const questionelement: HTMLElement = this.getQuestionElementFromQuestion(question['attributeName'], false);
          questionelement.getElementsByTagName('input')[0].checked = (this.globalattributestates[question['attributeName']] === 'true') ? true : false;

        } else if (question['inputType'] === 'datefield') {

          const questionelement: HTMLElement = this.getQuestionElementFromQuestion(question['attributeName'], false);
          const datearray = this.globalattributestates[question['attributeName']].split(' / ');

          if (datearray[0].length == 1) {
            datearray[0] = '0' + datearray[0];
          }

          if (datearray[1].length == 1) {
            datearray[1] = '0' + datearray[1];
          }
          question['defaultValue'] = new Date(datearray[2] + '-' + datearray[1] + '-' + datearray[0]);

        } else if (question['inputType'] === 'comboBox') {
          const questionelement: HTMLElement = this.getQuestionElementFromQuestion(question['attributeName'], false);
          for (let i = 0; i < questionelement.getElementsByTagName('select')[0].options.length; i++) {
            if (questionelement.getElementsByTagName('select')[0].options[i].value === this.globalattributestates[question['attributeName']]) {
              questionelement.getElementsByTagName('select')[0].selectedIndex = i;
            }
          }
        } else if (question['inputType'] === 'radio') {
          const questionelement: HTMLElement = this.getQuestionElementFromQuestion(question['attributeName'], false);
          
        }
      }
    });
  }
}
