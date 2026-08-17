import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { CreatequestionDialogComponent } from "./createquestion-dialog/createquestion-dialog.component";
import { Group } from "src/app/shared/models/Group";
import "grapesjs/dist/css/grapes.min.css";
import grapesjs from "grapesjs/dist/grapes.js";

import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { TableRows } from "src/app/shared/models/TableRows";
import { AttributeDto } from "src/app/shared/models/AttributeDto";
import { ParagraphCondition } from "src/app/shared/models/ParagraphCondition";
import { AttributeListResponse } from "src/app/shared/models/AttributeListResponse";
import { ParagraphConditionResponse, ParagraphSubconditionResponse } from "src/app/shared/models/ParagraphConditionResponse";
import { TemplateVersion } from "src/app/shared/models/TemplateVersion";
import { AddTemplateDialogComponent } from "../add-template-dialog.component";
import { MatExpansionPanel } from '@angular/material/expansion';
import { QuestionService } from '../../../Templateservices/question.service';
import { AlertdialogComponent } from 'src/app/shared/alertdialog/alertdialog.component';
import { ParagraphConditionService } from '../../../Templateservices/paragraphcondition.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { QuestionGroupDto } from 'src/app/shared/models/QuestionGroupDto';
import { QuestionGroupUpdateRequest } from 'src/app/shared/models/QuestionGroupUpdateRequest';
import customCodePlugin from 'grapesjs-custom-code';
import { TemplateHtmlSanitizerService } from 'src/app/shared/security/template-html-sanitizer.service';

@Component({
  selector: "app-designtemplate",
  templateUrl: "./designtemplate.component.html",
  styleUrls: ["./designtemplate.component.css"]
})
export class DesigntemplateComponent implements OnInit {
 
  @Input() data;
  @Input() createtemplateflag;
  @Input() parentdialogref;

  parentDialogreference: MatDialogRef<AddTemplateDialogComponent>;
  newtemplateflag;
  rowelementdata: TableRows;
  templateid: number;
  templateversion: number;
  panelOpenState = false;
  grouparray: Group[] = [];
  grouptogglearray: boolean[] = [false, false, false];
  questionGroups:any = {};
  sectionloader: boolean = false;
  editor;
  idOfQuestionDragged;
  textofQuestionDragged;
  mappingobj = {};
  commands;
  hello: boolean = false;
  totalconditionforms: number = 0;
  attributeDtoList: AttributeDto[] = [];
  questionlist: any[] = [];
  optioninnerhtmlstring: string = "";
  optioninnserhtmlstringforspan: string = "";
  paragraphConditionsList :ParagraphSubconditionResponse[]= [];

  currentlyselectedspan;
  currentlyselectedparagraph;
  paragraphidcounter = 0;
  spanidcounter = 0;
  universalelementid = 200;
  universalspanid = 200;
  questionid
  universaleditconditionid = 0;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private http: HttpClient,
    private templatedataservice:QuestionService,
    private paragraphservice:ParagraphConditionService,
    private templateHtmlSanitizer: TemplateHtmlSanitizerService
  ) {}

  ngOnInit() {
    this.newtemplateflag = this.createtemplateflag;
    this.rowelementdata = this.data;
    this.templateid = this.rowelementdata.templateId;
    this.templateversion = this.rowelementdata.templatePublishedVersion;
    this.parentDialogreference = this.parentdialogref;
    localStorage.setItem('admin-css','');

    //grapejs initialization
    this.editor = grapesjs.init({
      // Indicate where to init the editor. You can also pass an HTMLElement
      container: "#gjs",
      
      //to make editor on load event work
      // Get the content for the canvas directly from the element
      autorender: false,
      fromElement: true,

      // Size of the editor
      height: "81vh",
      width: "75vw",
      //creating dragable components using blocks
      // Avoid any default panel
      // Disable the storage manager for the moment

      canvas: {
        styles: [
          "https://fonts.googleapis.com/css?family=Archivo+Narrow:400,400i,700,700i|Roboto:300,300i,400,400i,500,500i,700,700i&subset=latin,latin-ext",
          "https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i&display=swap"
        ]
      },
      blockManager: {
        blocks: [
          {
            id: "Text",
            label: "Text",
            content: `
              <span droppable=true data-gjs-droppable="true"  > &nbsp;Insert your text here</span >
              `
          },
          {
            id: "image",
            label: "Image",
            // Select the component once it's dropped
            // in this case we also use a defined component type `image`
            // You can pass components as a JSON instead of a simple HTML string,
            select: true,
            content: { type: "image" },
            // This triggers `active` event on dropped components and the `image`
            // reacts by opening the AssetManager
            activate: true
          },
          {
            id: "Field",
            label: "Field",
            content:
              `<span  data-gjs-editable="false"  data-gjs-droppable="true" data-highlightable="1" class="spanclick" contenteditable="false" cust_tag="hellospan">&nbsp; _______&nbsp; </span>
              <style>
                  .spanclick{
                    color:inherit;
                  }
                </style>`
          },
          {
            id: "OfflineField",
            label: "Offline Field",
            content:
              '<span contenteditable="false" > &nbsp;............................................................................................................... </span>'
          },
          {
            id: "One_Column",
            label: "1 Row",
            content: `
                <div class="paragraphclick row" data-gjs-droppable=".row-cell" data-gjs-custom-name="Row" cust_tag="hellopara">
                  <div class="row-cell" data-gjs-draggable=".row"></div>
                </div>
                <style>
                  .row {
                    display: flex;
                    justify-content: flex-start;
                    align-items: stretch;
                    flex-flow:row wrap;
                    padding: 10px;
                    min-height: 75px;
                  }
                  .row-cell {
                    flex-grow: 1;
                    flex-basis: 100%;
                    padding: 5px;
                  }
                </style>
              `
          },
          {
            id: "two_Columns",
            label: "2 Rows",
            content: `
                <div class="row paragraphclick" data-gjs-droppable=".row-cell" data-gjs-custom-name="Row" cust_tag="hellopara">
                  <div class="row-cell" data-gjs-draggable=".row"></div>
                  <div class="row-cell" data-gjs-draggable=".row"></div>
                </div>
                <style>
                  .row {
                    display: flex;
                    justify-content: flex-start;
                    align-items: stretch;
                    flex-flow:row wrap;
                    padding: 10px;
                    min-height: 75px;
                  }
                  .row-cell {
                    flex-grow: 1;
                    flex-basis: 100%;
                    padding: 5px;
                  }
                </style>
              `
          },
          {
            id: "three_Columns",
            label: "3 Rows",
            content: `
                <div class="row paragraphclick" data-gjs-droppable=".row-cell" data-gjs-custom-name="Row" cust_tag="hellopara">
                  <div class="row-cell" data-gjs-draggable=".row"></div>
                  <div class="row-cell" data-gjs-draggable=".row"></div>
                  <div class="row-cell" data-gjs-draggable=".row"></div>
                </div>
                <style>
                  .row {
                    display: flex;
                    justify-content: flex-start;
                    align-items: stretch;
                    flex-flow:row wrap;
                    padding: 10px;
                    min-height: 75px;
                  }
                  .row-cell {
                    flex-grow: 1;
                    flex-basis: 100%;
                    padding: 5px;
                  }
                </style>
              `
          },
          {
            id: "page-break",
            label: `<svg viewBox="0 0 24 24">
            <path d="M 20,18 V 15 H 4 v 3 H 2 v -5 h 20 v 5 M 20,9 H 4 V 6 H 2 v 5 H 22 V 6 h -2 z"></path>
          </svg>
          <div>Page-Break</div>`,
          attributes: {class:'fa fa-page-break'},
            content: {
              type: 'page-break',
              tagName: 'div',
              activeOnRender: 1,
              style: {
                height: '10px',
                'background-color': 'lightgray',
                width: '100%',
                margin: 0,
                'page-break-before': 'always'
              }
            }
          },
          {
            id: "serial-number",
            label: 'Serial Number',
            content: `
            <span class="serial-number" id="serial-number" droppable=true data-gjs-droppable="true">
                <img id="textImage" src="assets/serial_number.png" class="avoid-clicks">
              </span>

              <style>
                .serial-number {
                  height:30px;
                  width:200px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-direction: column;
                }
                .avoid-clicks {
                  pointer-events: none;
                }
              </style>

            `
          },
          {
            id: "Signature",
            label: 'Registrar Signature',
            content: `<div class="signature-box" droppable=true  data-gjs-droppable="true" id="signature-box">
            <img id="textSignature" src="assets/registrar_signature.png" class="avoid-clicks-signature">
          </div>
           <style>
           .signature-box {
            width: 250px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
          .avoid-clicks-signature {
            pointer-events: none;
            
          }
            </style>
          `
          },
          {
            id: "user-signature",
            label: 'User Signature',
            content: `<div class="signature-box-user" droppable=true  data-gjs-droppable="true" id="signature-box-user">
            <img id="userSignature" src="assets/user_signature.png" class="avoid-clicks-signature-user">
          </div>
           <style>
           .signature-box-user {
            width: 250px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
          .avoid-clicks-signature-user {
            pointer-events: none;
            
          }
            </style>
          `
          },
          {
            id: "deponent-photo",
            label: 'Deponent Photo',
            content: `<div class="deponent-photo" droppable=true  data-gjs-droppable="true" id="deponent-photo">
            <img id="depoenent_image_id" src="assets/deponent_photo.png" class="deponent_photo_image">
          </div>
           <style>
           .deponent-photo {
            width: 110px;
            height: 110px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
          .deponent_photo_image {
            pointer-events: none;
            
          }
            </style>
          `
          },
          {
            id: "Nin-details",
            label: 'Verification Details',
            content: `
            <span class="nin-details" id="nin-details" droppable=true data-gjs-droppable="true">
                <img id="ninImage" src="assets/nin_details.png" class="nin_avoid_clicks">
              </span>
              <style>
                .nin-details {
                  height:30px;
                  width:350px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-direction: column;
                }
                .nin_avoid_clicks {
                  pointer-events: none;
                }
              </style>

            `
          },
          {
            id: "user-upload-photo",
            label: 'User Upload Photo',
            content: `<div class="user-photo" droppable=true  data-gjs-droppable="true" id="user-upload-photo">
            <img id="user_image_id" src="assets/user_upload_photo.png" class="user_photo_image">
          </div>
           <style>
           .user-photo {
            width: 110px;
            height: 110px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
          .user_photo_image {
            pointer-events: none;
            
          }
            </style>
          `
          }
        ]
      },

      storageManager: {
        id: "admin-", // Prefix identifier that will be used inside storing and loading
        type: "local", // Type of the storage
        autosave: true, // Store data automatically
        autoload: true, // Autoload stored data on init
        stepsBeforeSave: 1, // If autosave enabled, indicates how many changes are necessary before store method is triggered
        storeComponents: true, // Enable/Disable storing of components in JSON format
        storeStyles: false, // Enable/Disable storing of rules in JSON format
        storeHtml: true, // Enable/Disable storing of components as HTML string
        storeCss: true // Enable/Disable storing of rules as CSS string
      }
    });

    customCodePlugin(this.editor);
     //Add the image validation Logic here
     const am = this.editor.AssetManager;
     const checkAndAddImage = (image) => {
       const img = new Image();
       img.onload = () => {
         const imageWidth = img.width;
         const imageHeight = img.height;
         const maxWidth = 1000; // Set the maximum allowed width
         const maxHeight = 1000; // Set the maximum allowed height
         if (imageWidth > maxWidth || imageHeight > maxHeight) {
          this.openAlertDialogBox('Image size exceeds', "The chosen image dimensions exceeds the maximum allowed size of 1000*1000 pixels.", true);
           am.remove(image.get('src'));
           return false; 
         } else {
           // If the image size is within limits, add the image to the Asset Manager
         }
       };
       img.src = image.get('src');
     };
     const removeAllImage = () => {
         const am = this.editor.AssetManager;
       const assets = am.getAll();
       assets.forEach(asset => {
         if (asset.get('type') === 'image') {
           const img = new Image();
           img.onload = () => {
             const imageWidth = img.width;
             const imageHeight = img.height;
             const maxWidth = 1000; // Set the maximum allowed width
             const maxHeight = 1000; // Set the maximum allowed height
             if (imageWidth > maxWidth || imageHeight > maxHeight) {
               am.remove(asset.get('src'));
             }
           };
           img.src = asset.get('src');
         }
       });
     };
     
     removeAllImage();
     this.editor.on('asset:add', (image) => {
       checkAndAddImage(image);
     });
 
    this.editor.Panels.addPanel({
      id: "panel-top",
      el: ".panel__top"
    });

    this.editor.Panels.addPanel({
      id: "basic-actions",
      el: ".panel__basic-actions",
      buttons: [
        {
          id: "visibility",
          active: true, // active by d efault
          className: "btn-toggle-borders",
          label: "<u>B</u>",
          command: "sw-visibility" // Built-in command
        },
        {
          id: "export",
          className: "btn-open-export",
          label: "Exp",
          command: "export-template",
          context: "export-template" // For grouping context of buttons from the same panel
        },
        {
          id: "show-json",
          className: "btn-show-json",
          label: "JSON",
          context: "show-json",
          command(editor) {
            editor.Modal.setTitle("Components JzSON")
              .setContent(
                `<textarea style="width:100%; height: 250px;">
                  ${JSON.stringify(editor.getComponents())}
                </textarea>`
              )
              .open();
          }
        }
      ]
    });

    this.addFonts();

    this.editor.on("load", this.onEditorLoadEvent);
    this.editor.render();

    if(this.newtemplateflag === true){
      this.clearTemplateData(null);
      
    }else{

    }
    
    this.editor.on("canvas:drop", (event, component) => {
    
      component.set({removable: true});
      
      if (
        component.find("div > .row-cell") != undefined &&
        component.find("div > .row-cell").length > 0
      ) {
        
        for (let i = 0; i < component.find("div > .row-cell").length; i++) {
          component.find("div > .row-cell")[i].set("attributes", {
            id: "identify" + this.universalelementid++
          });
        }
        this.universalelementid+=200;
      }
    });

    this.universalspanid = this.editor.Canvas.getDocument().getElementsByTagName('span').length + 1;

   this.editor.on("component:clone", (component) => {
    
    if(component.attributes.tagName === 'span'){
      
      }else if(component.attributes.tagName === 'div'){

        for(let i=0;i<component.attributes.classes.models.length;i++){
          if(component.attributes.classes.models[i].id === 'row'){
            if(component["attributes"]["attributes"]["cust_tag"] !=undefined && component["attributes"]["attributes"]["cust_tag"] !=null && component["attributes"]["attributes"]["cust_tag"] !='hellopara'){
              
              let conditionidoforiginalelement:number = component["attributes"]["attributes"]["cust_tag"].split('#')[1].split('para')[1];
              //find condition object from paragraph condition object using this id

              this.paragraphConditionsList.forEach(paracondi=>{
                if(paracondi.paragraphConditionId == conditionidoforiginalelement){
                  
                  paracondi.paragraphConditionId = 0;
                  this.http.post(environment.url+"admin/template/saveParagraphCondition",paracondi).subscribe((data:ParagraphConditionResponse)=>{
                    
                    if(data.success === true){
                      component.set('attributes', { cust_tag: "<#para"+data.data.paragraphConditionId+"#>" })
                      this.getAllParagraphCondition();
                    }
                  },() =>{
                      window.alert("Something is not right !");
                  });
                }
              })

            }
          }
          if(component.attributes.classes.models[i].id === 'row-cell'){
            component.set('attributes', { id: "identify"+this.universalelementid+1 })
            this.universalelementid+=200;
            
          }
        }
    
    }
  });

  this.editor.on("update",(event) =>{
    this.addingDropevent();
  })

  }

  /**
   * For inserting custom fonts in stylemanager 
   *
   * @param {} 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  addFonts = () => {
    let styleManager = this.editor.StyleManager;
    
    let fontProperty = styleManager.getProperty("typography", "font-family");
    
    styleManager.addProperty("typography",{name:"font-style",property:'font-style',type: 'select',
    list: [{value:'italic',name:'Italic'},{value:'normal',name:'Normal'}]});

    styleManager.addProperty("typography",{name:"text-decoration",property:'text-decoration',type: 'select',    
    list: [ { value: 'none', name: 'None', className: 'fa fa-times'},
    { value: 'underline', name: 'underline', className: 'fa fa-underline' },
    { value: 'line-through', name: 'Line-through', className: 'fa fa-strikethrough'}]});

    let fontweightProperty = styleManager.getProperty("typography","font-style");
    
    let list = fontProperty.get("list");
    list.push({ value: "Roboto, Arial, sans-serif", name: "Roboto" });
    fontProperty.set("list", list);
    styleManager.render();
  };

  /**
   * Processing after Editor is loaded 
   *
   * @param {Event} event
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  onEditorLoadEvent = event => {

    this.addingDropevent();
    this.questionPopulate();

    const canvas = this.editor.Canvas;

    const rte = this.editor.RichTextEditor;
    rte.remove("strikethrough");
    rte.remove("link");
    this.editor.Keymaps.removeAll();
    
    this.getQuestionGroups();
    this.getAllParagraphCondition();
  };

     /**
   * this method fetches all conditions applied to paragraphs 
   *
   * @param {} 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  getAllParagraphCondition(){
    this.paragraphservice.fetchAllConditionsForTemplate(this.templateversion).subscribe(data=>{
      
      if(data["success"] === true){
        
        this.paragraphConditionsList = data["data"];
        for(let paracondi of this.paragraphConditionsList){
          paracondi.paragraphSubcondition.sort(this.dynamicSort());
        }
        
      }
    })
  }

  dynamicSort() {
    return function(a:ParagraphCondition, b:ParagraphCondition) {
        return (a.paragraphSubconditionId < b.paragraphSubconditionId) ? -1 : (a.paragraphSubconditionId > b.paragraphSubconditionId) ? 1 : 0;
    }
 }

   /**
   * Get all questions and groups for the template 
   *
   * @param {} 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  getQuestionGroups() {
    this.http
      .get(
        environment.url +
          "admin/template/getAllGroupTemplateQuestions/" +
          this.rowelementdata.templatePublishedVersion
      )
      .subscribe(
        //+this.rowelementdata.publishedVersionId
        (data: any) => {
          
          this.questionGroups = data.data;
          this.questionGroups.sort((a, b) => a["sequence"] < b["sequence"] ? -1 : a["sequence"] > b["sequence"] ? 1 : 0);
          this.questionlist = [];
          for (let i = 0; i < this.questionGroups.length; i++) {
            for (let j = 0; j < this.questionGroups[i]["templateQuestionDtos"].length; j++) {
              
              this.questionlist.push({
                attributeId:
                  this.questionGroups[i]["templateQuestionDtos"][j]["attributeDto"][
                    "attributeId"
                  ],
                questionText: this.questionGroups[i]["templateQuestionDtos"][j]["description"],
                questionId:this.questionGroups[i]["templateQuestionDtos"][j]["templateQuestionId"]
              });
            }
          }
          
          //inneroption html string for field options
           //add one disabled field in grouplist 
           this.questionGroups.forEach(questiongroup=>{
            questiongroup["disabled"] = false;
          });
          
          this.optioninnserhtmlstringforspan = "";
          for (let i = 0; i < this.questionlist.length; i++) {
            this.optioninnserhtmlstringforspan +=
              '<option value="' +
              this.questionlist[i].attributeId +
              '"  style="color:white;background-color:#4b4d52;border:0px;outline:none">' +
              this.questionlist[i].questionText +
              "</option>";
          }
          this.getListOfAttributes();
          
        },
        () => {
          
        }
      );
  }

   /**
   * After loading of Grapejs Editor set a tab of ConditionManager in right action bar
   *
   * @param {} 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  renderConditionManager() {
    const htmlinnerstring = document.getElementsByClassName(
      "gjs-pn-views-container"
    )[0];
    
    const node = document.createElement("div");
    this.templateHtmlSanitizer.replaceContent(
      node,
      '<div id="conditionmanager"  style="display:none"></div>'
    );
    node.addEventListener("click", this.selectConditionTab);
    htmlinnerstring.appendChild(node);
  }

  setConditionTab() {
    document.getElementsByClassName("condition")[0].id = "mycondi";
    document
      .getElementById("stylebutton")
      .addEventListener("click", this.addClickListener);
    document
      .getElementById("settingsbutton")
      .addEventListener("click", this.addClickListener);
    document
      .getElementById("layerbutton")
      .addEventListener("click", this.addClickListener);
    document
      .getElementById("blocksbutton")
      .addEventListener("click", this.addClickListener);
    document
      .getElementById("mycondi")
      .addEventListener("click", this.addClickListener);
  }

  /**
   * When we drop any component in canvas dropevent triggers and adds double click listener to elements
   *
   * @param {} 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  addingDropevent() {
    let document = this.editor.Canvas.getDocument();
    
    document
      .getElementById("wrapper")
      .addEventListener("drop", this.ondropEvent.bind(this));

    if (document.getElementsByClassName("paragraphclick").length > 0) {
      for (
        let i = 0;
        i < document.getElementsByClassName("paragraphclick").length;
        i++
      ) {
        document
          .getElementsByClassName("paragraphclick")
          [i].addEventListener("dblclick", this.selectConditionTabForParagraph);
      }
    }
    if (document.getElementsByClassName("spanclick").length > 0) {
      for (
        let i = 0;
        i < document.getElementsByClassName("spanclick").length;
        i++
      ) {
        document
          .getElementsByClassName("spanclick")
          [i].addEventListener("dblclick", this.selectConditionTabForSpan);
      }
    }

  }

  /**
   * Fetch all list of attributes for this template version to do mappings of fields 
   *
   * @param {} 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  getListOfAttributes() {
    //need versionId
    this.http
      .get(
        environment.url +
          "admin/template/getAllTemplateAttributes/" +
          this.templateversion
      )
      .subscribe(
        (data: AttributeListResponse) => {
          
          this.attributeDtoList = data.data;
          
          this.optioninnerhtmlstring = "";
          for (let i = 0; i < this.attributeDtoList.length; i++) {
            this.optioninnerhtmlstring +=
              '<option value="' +
              this.attributeDtoList[i].attributeId +
              '"  style="color:white;background-color:#4b4d52;border:0px;outline:none">' +
              this.attributeDtoList[i].attributeName +
              "</option>";
          }

          this.optioninnerhtmlstring +=
              '<option value="null"  style="color:white;background-color:#4b4d52;border:0px;outline:none">none</option>';

        },
        () => {
          
        }
      );
  }

  /**
   *Set default data in condition manager tab which we have set in right action panel
   *
   * @param {} 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  selectConditionTab = event => {

    document.getElementById("mycondi").click();
    document.getElementById("conditionmanager").style.display = "block";
    event.preventDefault();

  };

  /**
   * This method adds click listener to all tabs on right side for toggling data of condition manager 
   *
   * @param {Event} event 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  addClickListener = event => {
    
    if (
      event.target.id === "stylebutton" ||
      event.target.id === "settingsbutton" ||
      event.target.id === "layerbutton" ||
      event.target.id === "blocksbutton"
    ) {
      document.getElementById("conditionmanager").style.display = "none";
    } else {
      
      event.preventDefault();
    }
  };

  /** Paragraph click in design canvas related methods below */

  /**
   * This method sets condition Manager content on double click of Row elements 
   *
   * @param {Event} event 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  selectConditionTabForParagraph = event => {

    if(this.attributeDtoList.length === 0 ){
      this.openAlertDialogBox("Alert ","Please add questions first inorder to add conditions to this element ",true).afterClosed().subscribe((result) => {
        
      });
      return;
    }

    let itisrowflag = false;
    for(let jj = 0 ;jj<event["target"]["classList"].length;jj++){
      if(event["target"]["classList"][jj] ==="paragraphclick"){
        itisrowflag = true;
      }
    }

    if(itisrowflag === false){
      event.stopPropagation();
      return;
    }

    this.currentlyselectedparagraph = this.editor.getSelected();
    let flagofcondition = true;
    if(event.target["attributes"]["cust_tag"] != null && event.target["attributes"]["cust_tag"] != undefined && event.target["attributes"]["cust_tag"] != ""){
      if(event.target["attributes"]["cust_tag"].value === "hellopara"){
        flagofcondition = true;
      }else{
        flagofcondition = false;
        
      }
    }

    document.getElementById("mycondi").click();
    document.getElementById("conditionmanager").style.display = "block";
    document.getElementById("conditionmanager").textContent = "";
    const node = document.createElement("div");
    node.setAttribute("class","condimanager-cls");
    this.totalconditionforms++;

    let innerHtmlstring =
      '<p style="color: white;font-weight: 700;">Please Specify Conditions(if any)</p>' +
      '<form action="#" id="conditionform" name="conditionformgrapejs">' +
      "</form>" ;
      
    this.templateHtmlSanitizer.replaceContent(node, innerHtmlstring);
    document.getElementById("conditionmanager").appendChild(node);

    let innerhtmlactionstring = 
    '<button id="submitconditionform" style="background-color: var(--custombtnColor);border: 0px;padding: 2px;font-size: x-small;font-weight: 500;width: 31%;height: 40px;border-radius: 3px;color: white;margin:5px;">Submit</button>' +
    '<button id="addConditionbutton" style="background-color: var(--custombtnColor);border: 0px;padding: 2px;font-size: x-small;font-weight: 500;width: 31%;height: 40px;border-radius: 3px;color: white;margin:5px;">Add Condition</button>';

    let actionnode = document.createElement('div');
    actionnode.setAttribute("id","actionnode");
    actionnode.setAttribute("class","actiongroup-cls");
    this.templateHtmlSanitizer.replaceContent(actionnode, innerhtmlactionstring);
    document.getElementById("conditionmanager").appendChild(actionnode);

    let formnode = document.getElementById("conditionform");
    let childnode = document.createElement("div");
    childnode.setAttribute("id", "div" + this.totalconditionforms);
    childnode.setAttribute("class","condiinner-cls");

    let innerhtmlstringsecond="";
    if(flagofcondition === true){
        
      innerhtmlstringsecond = this.getConditionFormHtmlString(this.totalconditionforms);
      this.templateHtmlSanitizer.replaceContent(childnode, innerhtmlstringsecond);
      formnode.appendChild(childnode);
      formnode.style.backgroundColor = "white";
      formnode.style.transition="0.5s ease all";
      let interval =  setInterval(()=>{formnode.style.backgroundColor = "transparent";clearInterval(interval)},500);
  
      document.getElementById("addConditionbutton").addEventListener("click", this.addMoreCondition);
  
      document.getElementById("submitconditionform").addEventListener("click", this.submitOfConditionForm);

      this.universaleditconditionid = 0;
    }
    //logic for already mapped rows
   else{
      let mappedconditionId:number = event.target["attributes"]["cust_tag"].value.split('#')[1].split('para')[1]; 
      this.universaleditconditionid = mappedconditionId;
      this.paragraphConditionsList.forEach(paragraphcondi=>{
        if(paragraphcondi.paragraphConditionId == mappedconditionId){
          
          for(let i=0;i<paragraphcondi.paragraphSubcondition.length;i++){
            if(i>0){
              this.addMoreCondition(null);
              this.getConditionFormHtmlStringWhenParaIsMapped(paragraphcondi.paragraphSubcondition[i],this.totalconditionforms);

            }else{

              //generate first condition form 
              innerhtmlstringsecond = this.getConditionFormHtmlString(this.totalconditionforms);
              this.templateHtmlSanitizer.replaceContent(childnode, innerhtmlstringsecond);
              formnode.appendChild(childnode);
              formnode.style.backgroundColor = "white";
              formnode.style.transition="0.5s ease all";
              let interval =  setInterval(()=>{formnode.style.backgroundColor = "transparent";clearInterval(interval)},500);
      
              document.getElementById("addConditionbutton").addEventListener("click", this.addMoreCondition);
      
              document.getElementById("submitconditionform").addEventListener("click", this.submitOfConditionForm);
              this.getConditionFormHtmlStringWhenParaIsMapped(paragraphcondi.paragraphSubcondition[i],null);
            
            }
          }
        }
      })

    }
    
  };

  getConditionFormHtmlString(totalconditionformcount){

    let innerhtmlformstring =  '<p style="color: white;font-weight: 700;">Attribute Name</p>' +
    '<select name="attributename' +
    totalconditionformcount +
    '" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
    this.optioninnerhtmlstring+
    "</select>" +
    "<br><br>" +
    '<p style="color: white;font-weight: 700;">Comparator </p>' +
    '<select name="comparator' +
    totalconditionformcount +
    '" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
    '<option value="!=" style="color:white;background-color:#4b4d52;border:0px;outline:none;">!=</option>' +
    '<option value="==" style="color:white;background-color:#4b4d52;border:0px;outline:none;">==</option>' +
    "</select>" +
    "<br><br>" +
    '<p style="color: white;font-weight: 700;">Value</p>' +
    '<input name="value' +
    totalconditionformcount +
    '" type="text" style="background-color: transparent;border: 0px;border-bottom: 2px solid var(--custombtnColor);outline: none;color: white;width: 80%;" placeholder="Enter value"/>' +
    "<br><br>" +
    '<p style="color: white;font-weight: 700;">Operator</p>' +
    '<select name="operator' +
    totalconditionformcount +
    '" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
    '<option value="AND" style="color:white;background-color:#4b4d52;border:0px;outline:none">AND</option>' +
    '<option value="OR" style="color:white;background-color:#4b4d52;border:0px;outline:none">OR</option>' +
    "</select>" +
    "<br><br>";

    return innerhtmlformstring;
  }

  //this method will help in rendering data in condition manager tab when row is already mapped to some field

  getConditionFormHtmlStringWhenParaIsMapped(paragraphSubcondition,formcountidforsubconditions){

    if(formcountidforsubconditions === null){

    for (let i = 1; i <= this.totalconditionforms; i++) {
      let attributename = "attributename" + i;
      if(document.forms["conditionformgrapejs"][attributename] != undefined ){
      let x = document.forms["conditionformgrapejs"][attributename].options;
        for(let i=0;i<x.length;i++){
          if(x[i].value == paragraphSubcondition.attributeId){
            document.forms["conditionformgrapejs"][attributename].selectedIndex = i;
          }
        }
      }

      let comparatorname = "comparator" + i;
      if(document.forms["conditionformgrapejs"][comparatorname] != undefined){
      var y = document.forms["conditionformgrapejs"][comparatorname].options;
        for(let i=0;i<y.length;i++){
          if(y[i].value == paragraphSubcondition.operatorType){
            document.forms["conditionformgrapejs"][comparatorname].selectedIndex = i;
          }
        }
      
      }

      let valuename = "value" + i;
      if(document.forms["conditionformgrapejs"][valuename] != undefined ){
      document.forms["conditionformgrapejs"][valuename].value = paragraphSubcondition.value;
      
      }

      if(paragraphSubcondition.conditionType != ''){
      let operator = "operator" + i;
        if(document.forms["conditionformgrapejs"][operator] != undefined){
            var e = document.forms["conditionformgrapejs"][operator].options;
            for(let i=0;i<e.length;i++){
              if(e[i].value == paragraphSubcondition.conditionType){
                document.forms["conditionformgrapejs"][operator].selectedIndex = i;
              }
            }
        }
      }
    }

    }else{

      let attributename = "attributename" + formcountidforsubconditions;
      if(document.forms["conditionformgrapejs"][attributename] != undefined ){
      let x = document.forms["conditionformgrapejs"][attributename].options;
        for(let i=0;i<x.length;i++){
          if(x[i].value == paragraphSubcondition.attributeId){
            document.forms["conditionformgrapejs"][attributename].selectedIndex = i;
          }
        }
      }

      let comparatorname = "comparator" + formcountidforsubconditions;
      if(document.forms["conditionformgrapejs"][comparatorname] != undefined){
      var y = document.forms["conditionformgrapejs"][comparatorname].options;
        for(let i=0;i<y.length;i++){
          if(y[i].value == paragraphSubcondition.operatorType){
            document.forms["conditionformgrapejs"][comparatorname].selectedIndex = i;
          }
        }
      
      }

      let valuename = "value" + formcountidforsubconditions;
      if(document.forms["conditionformgrapejs"][valuename] != undefined ){
      document.forms["conditionformgrapejs"][valuename].value = paragraphSubcondition.value;
      
      }

      if(paragraphSubcondition.conditionType != ''){
        let operator = "operator" + formcountidforsubconditions;
          if(document.forms["conditionformgrapejs"][operator] != undefined){
              var e = document.forms["conditionformgrapejs"][operator].options;
              for(let i=0;i<e.length;i++){
                if(e[i].value == paragraphSubcondition.conditionType){
                  document.forms["conditionformgrapejs"][operator].selectedIndex = i;
                }
              }
          }
        }

    }

  }

  /**
   * Method calls when admin click on add conditions button inside condition manager tab after double clicking on row 
   *
   * @param {Event} event 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  addMoreCondition = event => {

    this.totalconditionforms++;
    let node = document.createElement("div");
    node.setAttribute("id", "div" + this.totalconditionforms);
    node.setAttribute("class", "condiinner-cls");
    
    let innerHtmlstring =
      '<button id="' +
      this.totalconditionforms +
      '" style="background-color: var(--custombtnColor);border: 0px;padding: 2px;font-size: x-small;font-weight: 500;width: 31%;height: 32px;border-radius: 3px;color: white;margin:5px;">Delete</button>' +
      '<p style="color: white;font-weight: 700;">Attribute Name</p>' +
      '<select name="attributename' +
      this.totalconditionforms +
      '" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
      this.optioninnerhtmlstring +
      "</select>" +
      "<br><br>" +
      '<p style="color: white;font-weight: 700;">Comparator </p>' +
      '<select name="comparator' +
      this.totalconditionforms +
      '" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
      '<option value="!=" style="color:white;background-color:#4b4d52;border:0px;outline:none">!=</option>' +
      '<option value="==" style="color:white;background-color:#4b4d52;border:0px;outline:none">==</option>' +
      "</select>" +
      "<br><br>" +
      '<p style="color: white;font-weight: 700;">Value</p>' +
      '<input name="value' +
      this.totalconditionforms +
      '" type="text" style="background-color: transparent;border: 0px;border-bottom: 2px solid var(--custombtnColor);outline: none;color: white;width: 80%;"  placeholder="Enter value"/>' +
      "<br><br>" +
      '<p style="color: white;font-weight: 700;">Operator</p>' +
      '<select name="operator' +
      this.totalconditionforms +
      '" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
      '<option value="AND" style="color:white;background-color:#4b4d52;border:0px;outline:none">AND</option>' +
      '<option value="OR" style="color:white;background-color:#4b4d52;border:0px;outline:none">OR</option>' +
      "</select>" +
      "<br><br>";
    
    this.templateHtmlSanitizer.replaceContent(node, innerHtmlstring);
    document.getElementById("conditionform").appendChild(node);
    document
      .getElementById(this.totalconditionforms + "")
      .addEventListener("click", this.deleteCondition);

  };

  /**
   * When admin wants to delete some conditions from condition manager on right side panel
   *
   * @param {Event} event 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  deleteCondition = event => {
    let buttonid = event["srcElement"]["id"];
    document.getElementById("div" + buttonid).remove();
  };

  submitOfConditionForm = event => {
    let requestObject = {};
    requestObject["paragraphSubcondition"] = [];
    requestObject["paragraphConditionId"] = 0;
    requestObject["templateVersionId"] = this.templateversion;

    let conditionobject;

    for (let i = 1; i <= this.totalconditionforms; i++) {
      conditionobject = new ParagraphCondition();

      let attributename = "attributename" + i;
      if (document.forms["conditionformgrapejs"][attributename] != undefined) {
        var x = document.forms["conditionformgrapejs"][attributename].value;
        conditionobject.attributeId = x;
      }

      let comparatorname = "comparator" + i;
      if (document.forms["conditionformgrapejs"][comparatorname] != undefined) {
        var y = document.forms["conditionformgrapejs"][comparatorname].value;
        conditionobject.operatorType = y;
      }

      let valuename = "value" + i;
      if (document.forms["conditionformgrapejs"][valuename] != undefined) {
        var z = document.forms["conditionformgrapejs"][valuename].value;
        conditionobject.value = z;
      }

      let operator = "operator" + i;

      if (document.forms["conditionformgrapejs"][operator] != undefined) {
        if (i < this.totalconditionforms) {
          var e = document.forms["conditionformgrapejs"][operator].value;
          conditionobject.conditionType = e;
        } else {
          conditionobject.conditionType = "";
        }
        requestObject["paragraphSubcondition"].push({ ...conditionobject });
      }
    }

    //call api to save paragraph condition
    //use ParagraphCondition

    let conditionresponseobject: ParagraphConditionResponse;
    let newidforparagraph: string = "";
    this.http
      .post(
        environment.url + "admin/template/saveParagraphCondition",
        requestObject
      )
      .subscribe(
        (data: ParagraphConditionResponse) => {
          
          if (data.success === true) {
            conditionresponseobject = data;
            newidforparagraph =
              "<#para" +
              conditionresponseobject.data.paragraphConditionId +
              "#>";
            //set new id according to response of api
            this.currentlyselectedparagraph.set({
              attributes: { cust_tag: newidforparagraph }
            });
            this.paragraphidcounter++;
          } else {
            window.alert("Error on saving conditions");
            
          }
          document.getElementById("conditionmanager").textContent = "";
          this.getAllParagraphCondition();
        },
        () => {
          window.alert("Something is not right !");
          
        }
      );
  };

  /** Span click in design canvas related methods below */
   /**
   * This method sets content of condition manager on double clicking fields for mapping them to questions
   *
   * @param {Event} event 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  selectConditionTabForSpan = event => {

    if(this.attributeDtoList.length === 0 ){
      this.openAlertDialogBox("Alert ","Please add questions first inorder to add conditions to this field ",true).afterClosed().subscribe((result) => {
        
      });
      return;
    }

    this.currentlyselectedspan = this.editor.getSelected();

    let flagofcondition = true;

    if(event.target["attributes"]["cust_tag"].value != null && event.target["attributes"]["cust_tag"].value != undefined && event.target["attributes"]["cust_tag"].value != ""){
      if(event.target["attributes"]["cust_tag"].value === "hellospan"){
        flagofcondition = true;
      }else{
        flagofcondition = false;
      }
    }
    else if(event.target.id!=null && event.target.id!=undefined && event.target.id!=""){
      flagofcondition = false;
    }else{
      flagofcondition = true;
    }
    
    document.getElementById("mycondi").click();
    document.getElementById("conditionmanager").style.display = "block";

    let innerHtmlstring = "";

    if(flagofcondition === true){
      innerHtmlstring = '<p style="color: white;font-weight: 700;">Please Specify Conditions(if any)</p>' +
      '<form id="questionform" name="questionspanform">' +
      '<p style="color: white;font-weight: 700;">Select Question</p>' +
      '<select name="questionattribute" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
      '<option value="none"  style="color:white;background-color:#4b4d52;border:0px;outline:none">--none--</option>'+
      this.optioninnserhtmlstringforspan+
      "</select>" +
      "<br></br>" +
      "<span id='questionattributeselect'></span>"+
      '<button id="submitspanform" style="background-color: var(--custombtnColor);border: 0px;padding: 5px;font-size: small;font-weight: 500;width: 31%;height: 32px;border-radius: 3px;color: white">Submit</button>' +
      "</form>";
    }else{
      
      //call method to return options with default selected option

      innerHtmlstring = '<p style="color: white;font-weight: 700;">Please Specify Conditions(if any)</p>' +
      '<form id="questionform" name="questionspanform">' +
      '<p style="color: white;font-weight: 700;">Select Question</p>' +
      '<select name="questionattribute" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
      '<option value="none"  style="color:white;background-color:#4b4d52;border:0px;outline:none">--none--</option>'
      +this.renderQuestionListForOptionsWithdefalultSelected(event.target["attributes"]["cust_tag"].value)+
      "</select>" +
      "<br></br>" +
      "<span id='questionattributeselect'></span>"+
      '<button id="submitspanform" style="background-color: var(--custombtnColor);border: 0px;padding: 5px;font-size: small;font-weight: 500;width: 31%;height: 32px;border-radius: 3px;color: white">Submit</button>' +
      "</form>";
    }

    this.templateHtmlSanitizer.replaceContent(
      document.getElementById("conditionmanager"),
      innerHtmlstring
    );
    document.getElementById("conditionmanager").style.backgroundColor="white";
    document.getElementById("conditionmanager").style.transition="0.5s ease all";
    let interval = setInterval(()=>{document.getElementById("conditionmanager").style.backgroundColor = "transparent";clearInterval(interval)},500);

      document.getElementById('submitspanform').addEventListener("click",this.submitForSpanForm);
      document.getElementsByName('questionattribute')[0].addEventListener("change",this.showAttibutesAttached);

    event.stopPropagation();
  };

  //this method is called when already mapped field is double clicked and it helps to show mapped question to the admin

  renderQuestionListForOptionsWithdefalultSelected(attributeName){
    
    let selectedoptionquestionstring="" ;
    let selectedquestionid;
    let attributeId;
    this.questionGroups.forEach(groups=>{
      
      //check that if field is mapped directly to the question attribute 
      groups["templateQuestionDtos"].forEach(question=>{
        if(question["attributeName"] === attributeName){
          selectedoptionquestionstring ='<option value="'+question["attributeDto"]["attributeId"]+'"  style="color:white;background-color:#4b4d52;border:0px;outline:none" selected>'+question["description"]+'</option>'
          selectedquestionid = question["templateQuestionId"];
          attributeId = question["attributeDto"]["attributeId"];
        }

        //check if field is mapped to any attribute inside question options in case of combobox , checkbox , radiobutton
        if(question["inputType"] != "textfield" && question["inputType"] != 'datefield'){
        question["questionOptionDto"].forEach(questionoption=>{
          questionoption["questionOptionActionDto"].forEach(questionoptionaction=>{
            if(questionoptionaction["attribute"]["attributeName"] === attributeName){
              selectedoptionquestionstring ='<option value="'+question["attributeDto"]["attributeId"]+'"  style="color:white;background-color:#4b4d52;border:0px;outline:none" selected>'+question["description"]+'</option>'
              selectedquestionid = question["templateQuestionId"];
              attributeId = questionoptionaction["attribute"]["attributeId"];
            }
          })
        });
      }
      });
    });

    let optionsHtmlstringwithselectedoption =""
        for(let i = 0 ;i<this.questionlist.length;i++){
          
          if(selectedquestionid === this.questionlist[i].questionId){
            optionsHtmlstringwithselectedoption += selectedoptionquestionstring;
          }else{
            optionsHtmlstringwithselectedoption+='<option value="'+this.questionlist[i].attributeId+'"  style="color:white;background-color:#4b4d52;border:0px;outline:none">'+this.questionlist[i].questionText+'</option>' ;
          }
          
      }
    
    this.showAttributeListWithSelectedOptionOnMappedFields(attributeId,attributeName,selectedquestionid);
    return optionsHtmlstringwithselectedoption;
  }

   //this method is used to show attribute list of mapped question to the already mapped field
   showAttributeListWithSelectedOptionOnMappedFields(attributeId,attributeName,questionid){

    this.templatedataservice.getAllQuestionAttributes(questionid).subscribe(data=>{
      if(data["success"] === true){

        let optioninnerhtmlforattributename ='<option value="none"  style="color:white;background-color:#4b4d52;border:0px;outline:none">--none--</option>';
        for(let i=0;i<data["data"].length;i++){
          if(attributeId === data["data"][i]["attributeId"]){
            optioninnerhtmlforattributename += '<option value="'+data["data"][i]["attributeId"]+'"  style="color:white;background-color:#4b4d52;border:0px;outline:none" selected>'+data["data"][i]["attributeName"]+'</option>' ;
          }else{
            optioninnerhtmlforattributename += '<option value="'+data["data"][i]["attributeId"]+'"  style="color:white;background-color:#4b4d52;border:0px;outline:none">'+data["data"][i]["attributeName"]+'</option>' ;
          }
        }

        let selectattributeofquestioninnerhtml = '<p style="color: white;font-weight: 700;">Select sub attributes of question</p>'+
        '<select name="attributename" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
        optioninnerhtmlforattributename+
        "</select>"+
        "<br></br>" ;
        this.templateHtmlSanitizer.replaceContent(
          document.getElementById('questionattributeselect'),
          selectattributeofquestioninnerhtml
        );

      }else{
        
      }
    },() => {
      
    })
  }

  /**
   * This method calls when admin double clicks on already mapped fields and in this case this method sets condition manager tab to attached mapped question
   *
   * @param {Event} event 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  showAttibutesAttached = (event) =>{
    
    if( document.forms["questionspanform"]["questionattribute"].value === "none")
    return;

    let questionid :number =0;
    for(let i=0;i<this.questionlist.length;i++){
      if(this.questionlist[i]["attributeId"] == document.forms["questionspanform"]["questionattribute"].value){
        questionid = this.questionlist[i]["questionId"];
      }
    }

    this.templatedataservice.getAllQuestionAttributes(questionid).subscribe(data=>{
      
      if(data["success"] === true){

        let optioninnerhtmlforattributename ='<option value="none"  style="color:white;background-color:#4b4d52;border:0px;outline:none">--none--</option>';
        for(let i=0;i<data["data"].length;i++){
          optioninnerhtmlforattributename += '<option value="'+data["data"][i]["attributeId"]+'"  style="color:white;background-color:#4b4d52;border:0px;outline:none">'+data["data"][i]["attributeName"]+'</option>' ;
        }

        let selectattributeofquestioninnerhtml = '<p style="color: white;font-weight: 700;">Select sub attributes of question</p>'+
        '<select name="attributename" style="border-right: 0px;border-left: 0px;border-top: 0px;color:white;background-color: #ffffff00;border-bottom: 2px solid var(--custombtnColor);outline: none;height: 28px;width: 80%;box-shadow: 0 0 0px black;">' +
        optioninnerhtmlforattributename+
        "</select>"+
        "<br></br>" ;
        this.templateHtmlSanitizer.replaceContent(
          document.getElementById('questionattributeselect'),
          selectattributeofquestioninnerhtml
        );

      }else{
        
      }
    },() => {
      
    })

  }

  /**
   * This method calls when admin mapped field to question attribute and hit submit button and sets question attributeid to cust_tag of target element
   *
   * @param {Event} event 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  submitForSpanForm = (event) =>{

    if(document.forms["questionspanform"]["attributename"].value === "none"){
      this.openAlertDialogBox("Alert ","Please Select a valid attribute ",true).afterClosed().subscribe((result) => {
        
      });
      return;
    }

    let selectedattributename ="hell"; 

    for(let i = 0 ;i<this.attributeDtoList.length;i++){
      if(this.attributeDtoList[i].attributeId == document.forms["questionspanform"]["attributename"].value){
        selectedattributename = this.attributeDtoList[i].attributeName;
      }
    }

    this.currentlyselectedspan.set({
      attributes: { cust_tag:""+selectedattributename},
      content: ' # '+document.forms["questionspanform"]["questionattribute"].selectedOptions[0].innerText+' # ',
      style: {'border-bottom':"1px solid black"}
    });

    document.getElementById("conditionmanager").textContent = "";
    this.spanidcounter++;
    
  }

  /**
   * On drop of any component in canvas or dropping of questions from question block 
   *
   * @param {Event} event 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  ondropEvent(event) {
    if (this.idOfQuestionDragged != null) {

      let mycomponent = null;
      let component: [] = this.editor.DomComponents.getWrapper().find(
        "div .row-cell"
      );
      if (component != undefined && component.length > 0) {
        for (let i = 0; i < component.length; i++) {
          if (
            component[i]["attributes"]["attributes"]["id"] === event.target.id
          ) {
            mycomponent = component[i];
            var comp1 = this.editor.DomComponents.addComponent({
              tagName: "span",
              removable: true, // Can't remove it
              draggable: true, // Can't move it
              copyable: true,
              editable: false, // Disable copy/past
              content: ' # '+this.textofQuestionDragged+' # ', // Text inside component
              style: {'border-bottom':"1px solid black"},
              attributes: { id: this.idOfQuestionDragged+this.universalspanid ,cust_tag:this.idOfQuestionDragged}
            });
            comp1.addClass('spanclick');
            comp1.remove();

            mycomponent.append(comp1);
            let document_ = this.editor.Canvas.getDocument();
            document_.getElementById( this.idOfQuestionDragged+this.universalspanid).addEventListener( "dblclick",
            this.selectConditionTabForSpan);
            this.universalspanid+=200;
          }
        }
      }

      if (mycomponent === null) {
        this.openAlertDialogBox("Alert ","Please drop question inside a column  ",true).afterClosed().subscribe((result) => {
        
        });
      } else {
      }

      this.idOfQuestionDragged = null;
    }

    let document = this.editor.Canvas.getDocument();

    if (document.getElementsByClassName("paragraphclick").length > 0) {
      let paralength = document.getElementsByClassName("paragraphclick").length;

      document
        .getElementsByClassName("paragraphclick")
        [paralength - 1].addEventListener(
          "dblclick",
          this.selectConditionTabForParagraph
        );
    }
    if (document.getElementsByClassName("spanclick").length > 0) {
      let spanlenght = document.getElementsByClassName("spanclick").length;

      document
        .getElementsByClassName("spanclick")
        [spanlenght - 1].addEventListener(
          "dblclick",
          this.selectConditionTabForSpan
        );
    }
    //       "dblclick",
    //     [paralength - 1].addEventListener(
    //     .getElementsByClassName("row")
    //   document

  }

  /** Question specific methods below */

  questionPopulate() {

    this.renderConditionManager();
    this.setConditionTab();
  
    //forming optioninnerhtmlstring
    //alternate code for getListOfAttributes until we get api for this
  }

  addQuestion() {
    
    let dialogref = this.dialog.open(CreatequestionDialogComponent, {
      data: { data : this.rowelementdata }
    });

    dialogref.afterClosed().subscribe(data => {
      //fetch all attributes again
      
      this.getQuestionGroups();
      this.getListOfAttributes();
      document.getElementById("conditionmanager").style.display = "none";
      
    });
  }

  toggle(index) {
    this.grouptogglearray[index] = !this.grouptogglearray[index];
  }

  /**
   * This method is called when admin wants to edit question
   *
   * @param groupDesc ,@param  question 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  editQuestion(groupDesc,question) {

    let attachedflag = this.checkQuestionAttributesAreAttached(groupDesc,question);
    let dialogref = this.dialog.open(CreatequestionDialogComponent, {
      data: { data : this.rowelementdata,
              groupDesc :   groupDesc,
              question : question,
              questionGroupId : question.templateQuestionId,
              canteditflag:attachedflag.flag,
              whycant:attachedflag.message
              }
    });

    dialogref.afterClosed().subscribe(data => {
      //fetch all attributes again
      
      this.getQuestionGroups();
     
      document.getElementById("conditionmanager").style.display = "none";
     
    });
  }

   /**
   * This method delete questions and warn users for any attached elements in canvas
   *
   * @param group ,@param  question 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  deleteQuestion(group, question) {

   let attachedflag ;
   let _document = this.editor.Canvas.getDocument();
   let attachedelementarray:HTMLElement[] = _document.getElementsByTagName('span');
   
   attachedflag = this.checkQuestionAttributesAreAttached(group,question);

   if(attachedflag.flag == false){
   this.openAlertDialogBox("Delete question","You want to delete this question ?",false).afterClosed().subscribe((result) => {
     
    if (result == "Yes") {
       
      for(let i=0;i<this.questionGroups.length;i++){
         
        if(this.questionGroups[i]["questionGroupId"] == group["questionGroupId"]){
           
          for(let j=0;j<this.questionGroups[i]["templateQuestionDtos"].length;j++){
             
            if(this.questionGroups[i]["templateQuestionDtos"][j]["templateQuestionId"] == question["templateQuestionId"]){
               //call api to delete question 
               this.templatedataservice.deleteQuestionFromTemplateVersion(this.questionGroups[i]["templateQuestionDtos"][j]["templateQuestionId"])
               .subscribe(data=>{
                 if(data["success"] == true){
                   this.questionGroups[i]["templateQuestionDtos"].splice(j,1);
                 
                  }else{

                 }
                 
               },() =>{
                 
               })
               
             }
           }
         }
       }
     }
   });
 
  }else{
   
    this.openAlertDialogBox("Delete question","The question you are trying to delete is currently used "+attachedflag.message,true).afterClosed().subscribe((result) => {
     if (result === "Yes") {
       for(let i=0;i<attachedelementarray.length;i++){
         if(attachedelementarray[i]["attributes"]["cust_tag"] != undefined && attachedelementarray[i]["attributes"]["cust_tag"].value === question["attributeName"]){
           attachedelementarray[i].style.backgroundColor = "";
         }
       }
     }
   });
 }
}

  /**
   * This method used to check if question attributes are attached to any condition or any template paragraph or field 
   *
   * @param group object and ,question object 
   * @returns boolean flag attached or not
   * @memberof DesigntemplateComponent
   */
  checkQuestionAttributesAreAttached(group, question){

    let message :string ;
    let attachedflag = false;
    let _document = this.editor.Canvas.getDocument();
    let quesitonAttributeList  = [];
    let attachedelementarray:HTMLElement[] = _document.getElementsByTagName('span');
  
    //first fetch all attributes inside question , question options if its type is combobox , radiobutton , checkbox
    quesitonAttributeList.push(question['attributeDto']['attributeName']);
    if(question['inputType'] == 'comboBox' || question['inputType'] == 'radio' || question['inputType'] == 'checkBox'){
      question['questionOptionDto'].forEach(questionoption=>{
        
        questionoption['questionOptionActionDto'].forEach(questionoptionaction=>{
  
          if(!quesitonAttributeList.includes(questionoptionaction['attribute']['attributeName'])){
            quesitonAttributeList.push(questionoptionaction['attribute']['attributeName']);
          }
  
        });
      });
    }
  
    //check for other questions visibility conditions that above attribute list have any attribute attached to those question visibitility conditions 
    for(let v=0;v<this.questionGroups.length;v++){
  
      for(let i=0;i<this.questionGroups[v]['templateQuestionDtos'].length;i++){
  
        if(!!this.questionGroups[v]['templateQuestionDtos'][i]['questionConditionDtos']){
  
          for(let j=0;j<this.questionGroups[v]['templateQuestionDtos'][i]['questionConditionDtos'].length;j++){
            if(!!this.questionGroups[v]['templateQuestionDtos'][i]['questionConditionDtos'][j]['subconditionDtos']){
  
              for(let m=0;m<this.questionGroups[v]['templateQuestionDtos'][i]['questionConditionDtos'][j]['subconditionDtos'].length;m++){
  
                for(let k=0;k<quesitonAttributeList.length;k++){
  
                  if(this.questionGroups[v]['templateQuestionDtos'][i]['questionConditionDtos'][j]['subconditionDtos'][m]['attribute']['attributeName'] == quesitonAttributeList[k]){

                    message = 'Inside question visibility conditions of Question '+   this.questionGroups[v]['templateQuestionDtos'][i]['description'];
                    attachedflag = true;
                    return {flag:attachedflag,message:message};
                  }
                }
              }
            }
  
          }
  
        }
  
      }
  
    }

    // check Template have any attribute mentioned in it or not 
    for(let i=0;i<attachedelementarray.length;i++){
     
      for(let j=0;j<quesitonAttributeList.length;j++){
        if(attachedelementarray[i]["attributes"]["cust_tag"] != undefined && attachedelementarray[i]["attributes"]["cust_tag"].value == quesitonAttributeList[j]){
          
          message = "Inside Template "
          attachedflag = true;  
          return {flag:attachedflag,message:message};
        }
      }
    }
  
    //last step to check paragraph visibility conditions have these above attribute list init
    
    this.paragraphConditionsList.forEach(paracondition=>{
      if(!!paracondition['paragraphSubcondition']){
        paracondition["paragraphSubcondition"].forEach(parasubcondi=>{
          for(let i=0;i<quesitonAttributeList.length;i++){
            if( !!parasubcondi['attribute'] && (parasubcondi['attribute']['attributeName'] == quesitonAttributeList[i])){
              
              message = " Inside Paragraph visibility conditions "
              attachedflag = true;
              return {flag:attachedflag,message:message};
            }
          }
        
        })
      }
    })
  
    return {flag:attachedflag,message:message};
  
  }

 /**
   * This method show properties of questions 
   *
   * @param question 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  openProperties(question) {
    if(this.questionid === question){
      this.questionid = null;
    }else{
      this.questionid = question;
    }
  }

  activateSectionLoader() {
    this.sectionloader = !this.sectionloader;
  }

   /**
   * This method triggers when question is dragged from left and this method sets global question attribute which is being dragged
   *
   * @param {Event} event
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  onQuestionDragEvent(event) {
    
    this.idOfQuestionDragged = event["attributeDto"]["attributeName"];
    this.textofQuestionDragged = event["description"];

  }

  wait(ms){
    
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
  }

   /**
   * This method will be called when user click on save & close template and this method is responsible to save all template related data to database
   *
   * @param {Event} event ,@param {boolean} closeflag 
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  saveTemplateData(event,closeflag) {

    let _document = this.editor.Canvas.getDocument();
    _document.getElementById('wrapper').click();
    this.wait(500);

    let templaterequest = new TemplateVersion();
    templaterequest.versionValue = this.editor.getHtml();
    templaterequest.versionCss = this.editor.getCss();
    templaterequest.templateId = this.rowelementdata.templateId;
    templaterequest.versionId = this.rowelementdata.templatePublishedVersion;
    templaterequest.archive = null;
    templaterequest.published = null;
    templaterequest.versionName = null;
    templaterequest.versionComponent = localStorage.getItem("admin-components");
    templaterequest.versionStyles = localStorage.getItem("admin-styles");
    templaterequest.versionAsset = localStorage.getItem("admin-assets");
    this.http.post(environment.url + "admin/template/updateTemplateDesign",templaterequest).subscribe(
      (data: any) => {

       if(data["success"] === true){
         if(closeflag === true){
          this.clearTemplateData(null);
          this.parentDialogreference.close(templaterequest);
         }else{
           
         }
       
      }else{
         window.alert("Template can't save right now");
       }
      },
      () => {
        
        window.alert("Template can't save right now");
      }
    );
  }

   /**
   * This method clears all canvas data 
   *
   * @param {Event} event
   * @returns {}
   * @memberof DesigntemplateComponent
   */
  clearTemplateData(event) {
    
    if(event === null){
      this.editor.DomComponents.clear();
    }else{
  
      this.openAlertDialogBox("Clear Template","All your changes will be lost. Do you still want to clear template data ?",false).afterClosed().subscribe((result) => {
        if (result === "Yes") {
          this.editor.DomComponents.clear();
        } 
      });
    }
  }

  expandPanel(matExpansionPanel: MatExpansionPanel, event: Event): void {
    event.stopPropagation(); // Preventing event bubbling
    
    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.toggle(); // Here's the magic
    }
  }
  
  private _isExpansionIndicator(target: EventTarget): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (target['classList'] && target['classList'].contains(expansionIndicatorClass));
  }

  openAlertDialogBox(actionnamestrign,messagestring,onlycloseflag):MatDialogRef<AlertdialogComponent>{
    let dialogref = this.dialog.open(AlertdialogComponent, {
      "data": {actionname:actionnamestrign,message:messagestring,onlyclose:onlycloseflag}
    });

    return dialogref;
  }
  
  drop(event: CdkDragDrop<string[]>) {
    
    moveItemInArray(this.questionGroups, event.previousIndex, event.currentIndex);
    
    let questiongrouplist:QuestionGroupDto[] = [];
    let sequence = 0;
    this.questionGroups.forEach(questionGroup=>{
      let questionGroupDtotemp = new QuestionGroupDto();
      questionGroup.sequence = sequence;
      sequence ++;
      questionGroupDtotemp.description = questionGroup.description;
      questionGroupDtotemp.sequence = questionGroup.sequence;
      questionGroupDtotemp.groupId = questionGroup.questionGroupId;
      questionGroupDtotemp.templateVersionId  = this.templateversion;
      questiongrouplist.push(questionGroupDtotemp);
    });
    
    //call api to update sequence numbers updateGroupSequences
    let questionGroupUpdateRequest = new  QuestionGroupUpdateRequest();
    questionGroupUpdateRequest.groupDtoList = questiongrouplist;
    this.templatedataservice.updateGroupSequencing(questionGroupUpdateRequest).subscribe(data=>{
      
    },() =>{

    });
  }

}
