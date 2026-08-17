     //ordering of subattributes acc to questionOptionActionIds
    //Add Sequence number and add attribute dto using attribute Names
    //Add Sequence number and add attribute dto using attribute Names
  //On tab/focus out of sub attribute fields and to add <# #> to the value
  //On tab/focus out of attribute field and to add <# #> to the value
  //On tab/focus out of option value field
  //To Populate Attribute Names from ID as only ID field is available under attribute dto
        //Type and suggest functionality
  //To fetch list of attributes for a particular template version id
        //Type and suggest functionality
    //Check for Edit Flow
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { TemplateQuestionDto } from '../../../../../../../shared/models/TemplateQuestionDto';
import { QuestionGroupDto } from '../../../../../../../shared/models/QuestionGroupDto';
import { AttributeDto } from '../../../../../../../shared/models/AttributeDto';
import { QuestionOptionDto } from '../../../../../../../shared/models/QuestionOptionDto';
import { QuestionOptionActionDto } from '../../../../../../../shared/models/QuestionOptionActionDto';
import { QuestionConditionDto } from '../../../../../../../shared/models/QuestionConditionDto';
import { QuestionSubconditionDto } from '../../../../../../../shared/models/QuestionSubconditionDto';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { QuestionService } from '../../../../Templateservices/question.service';

@Component({
  selector: 'app-createquestion-dialog',
  templateUrl: './createquestion-dialog.component.html',
  styleUrls: ['./createquestion-dialog.component.css']
})
export class CreatequestionDialogComponent implements OnInit {

  elementrow;
  templateid;
  templateversionid;
  createquestionformgroup :FormGroup;
  errorflag:boolean = false;
  errormessage = "";
  showOptions = false;
  selectedTab:number = 0;
  templateQuestion:TemplateQuestionDto = new TemplateQuestionDto();
  attributeDto:AttributeDto = new AttributeDto();
  questionOptions:QuestionOptionDto[]= [];
  questionConditions:QuestionConditionDto[]=[];

  operator:string;
  groupList:QuestionGroupDto[] =[];
  filteredGroups: Observable<QuestionGroupDto[]>;

  attributeList:AttributeDto[] =[];
  subAttributeList:AttributeDto[] =[];
  filteredAttributeList: Observable<AttributeDto[]>;
  isOptionDisabled:boolean = false;

  defaultValueList = [];
  showDatePicker = false;

    headerText:string = "Add new Question";
  isCreateFlow:boolean = true;
  selected =  '';
  groupsequencecount = 0; 
  canteditattribute = false;
  whycantmessage = '';
  shouldSubmitForm = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogref: MatDialogRef<CreatequestionDialogComponent>,
    private loadingservice:LoadingscreenService,
    private questionService:QuestionService
  ) {
  }

  ngOnInit() {

    this.elementrow = this.data.data;
    if(this.elementrow["templateVersionId"] != null && this.elementrow["templateVersionId"] != undefined ){
      this.templateid = this.elementrow.templateId;
      this.templateversionid = this.elementrow.templateVersionId;
    }
    else{
      if(this.elementrow !=null){
      
      this.templateid = this.elementrow.templateId;
      this.templateversionid = this.elementrow.templatePublishedVersion;
      }
    }

    if(!!this.data['canteditflag'] && this.data['canteditflag'] == true){
      this.canteditattribute = true;
      if(!!this.data['whycant'] ){
        this.whycantmessage  = this.data['whycant'];
        
      }
    
    }

    this.createquestionformgroup = new FormGroup({
      questionDesc: new FormControl("", Validators.required),
      groupName: new FormControl("",Validators.required),
      inputType: new FormControl("", Validators.required),
      sequenceNumber:new FormControl("",Validators.required),
      attribute:new FormControl("",Validators.required),
      defaultValue: new FormControl("")
    });

    //Check for Edit Flow
    if(this.data.question != undefined){
      this.isCreateFlow = false;
      this.populateValueFromDto(this.data.question,this.data.groupDesc,this.data.questionGroupId);
    }

    if(this.isCreateFlow){
      this.addCondition("");
    }else{
      this.questionConditions.forEach((element, index) => {
        if(element.subconditionDtos == null || element.subconditionDtos == undefined || element.subconditionDtos.length ==0){
            element.subconditionDtos = [];
            element.subconditionDtos.push(new QuestionSubconditionDto());
        } 
      });
    }
    this.getGroups();
    this.getAttributeList();
    
      if(this.createquestionformgroup.controls['inputType'].value=='datefield'){

        this.createquestionformgroup.controls['defaultValue'].patchValue('dd/mm/yyyy');
        this.createquestionformgroup.controls['defaultValue'].disable();
  
      }
    
  }

  getGroups(){
    this.questionService.getAllTemplateGroups(this.templateversionid).subscribe((data: any) => {
        this.groupList = data.data;
        //Type and suggest functionality
        this.filteredGroups = this.createquestionformgroup.controls['groupName'].valueChanges
        .pipe(
          startWith(''),
          map(val => {
            return this._filterGroup(val || '')
          })       
        );
        
        let max = -1;
        this.groupList.forEach(group=>{
          if(group.sequence > max)
            max = group.sequence;
        });
        this.groupsequencecount = max+1;

      },
      () => {
          
      }
    );
  }

  //To fetch list of attributes for a particular template version id
  getAttributeList(){
    this.questionService.getAllTemplateAttributes(this.templateversionid).subscribe((data: any) => {
        this.attributeList = data.data;
        this.subAttributeList = data.data;
        if(!this.isCreateFlow){
          this.populateAttributeNames();  
        }
        //Type and suggest functionality
        this.filteredAttributeList = this.createquestionformgroup.controls['attribute'].valueChanges
        .pipe(
          startWith(''),
          map(val => {
            return this._filterAttribute(val || '')
          })       
        );
      },
      () => {

      }
    );
  }

  //To Populate Attribute Names from ID as only ID field is available under attribute dto
  private populateAttributeNames(){   
    this.questionOptions.forEach((option) => {
      option.questionOptionActionDto.forEach((action) => {
          
      });
    });
    
    this.questionConditions.forEach((condition) => {
      condition.subconditionDtos.forEach((subCondition) => {
         
      });
    });
  
  }

  checkforkey(event){
    
    event.target.value = event.target.value; 
    event.stopImmediatePropagation();
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

  addKey(actionsList){
      actionsList.push(new QuestionOptionActionDto());
  }

  deleteKey(index,actionsList){
    if(actionsList.length>1)
      actionsList.splice(index,1);
  }

  addOptions(optionName,optionActionValue,inputType){
    
    var newOption = new QuestionOptionDto();
    var newOptionAction = new QuestionOptionActionDto();
    newOptionAction.attribute.attributeName = this.createquestionformgroup.controls['attribute'].value;
    if(inputType == 'Checkbox'){
      newOptionAction.value = optionActionValue;
    }
    newOption.questionOptionActionDto.push(newOptionAction);
    newOption.optionValue = optionName;
    this.questionOptions.push(newOption);
  }

  deleteOptions(index){
    if(this.questionOptions.length>1){
      this.questionOptions.splice(index,1);
      this.createDefaultList();  
    }    
  }

  createDefaultList(){
    this.defaultValueList=[]
      for(let qo of this.questionOptions){
        this.defaultValueList.push(qo.optionValue)
      }
  }

  toggleOptionsSection(){
    this.createquestionformgroup.controls['defaultValue'].enable();
    if(this.createquestionformgroup.controls['inputType'].value=='comboBox' || this.createquestionformgroup.controls['inputType'].value=='radio'){
      this.createquestionformgroup.controls['defaultValue'].reset();
      this.questionOptions = [];
      this.addOptions('','','');
      this.isOptionDisabled = false;
      this.showOptions = true;
      this.defaultValueList = [];
    }else if(this.createquestionformgroup.controls['inputType'].value=='checkBox'){
      this.createquestionformgroup.controls['defaultValue'].reset();
      this.defaultValueList = [];
      this.questionOptions = [];
      this.defaultValueList.push(true);
      this.defaultValueList.push(false);
      this.addOptions('Checked',true,'Checkbox');
      this.addOptions('Unchecked',false,'Checkbox');
      this.isOptionDisabled = true;
      this.showOptions = true;
    }
    else if(this.createquestionformgroup.controls['inputType'].value=='datefield'){

          this.createquestionformgroup.controls['defaultValue'].patchValue('dd/mm/yyyy');
          this.createquestionformgroup.controls['defaultValue'].disable();
          this.showOptions = false;
    
      }
    else{
         this.createquestionformgroup.controls['defaultValue'].reset();
          this.showOptions = false;
    }
      
  }

  nextTab(){
    if(this.createquestionformgroup.status == "VALID" && this.shouldSubmitForm){
      this.errormessage = ""
      this.errorflag = false;
      this.selectedTab +=1;
    }else{
      this.errormessage = "*Please fill all the manadatory fields."
      this.errorflag = true;
    }    
  }

  addCondition(operator){
    if(this.questionConditions.length<2){
      if(operator!=undefined && operator!="")
        this.questionConditions[this.questionConditions.length-1].conditionType = operator;
      var newCondition = new QuestionConditionDto();
      newCondition.subconditionDtos.push(new QuestionSubconditionDto());
      this.questionConditions.push(newCondition);
    }
  }

  deleteCondition(index){
    if(this.questionConditions.length != 1)
      this.questionConditions.splice(index,1);
    
  }

  addSubCondition(subconditionsList){
    subconditionsList.push(new QuestionSubconditionDto());
  }

  deleteSubCondition(index,subconditionsList){

    if(subconditionsList.length > 1)
      subconditionsList.splice(index,1);

    if(subconditionsList.length <= 1){
      subconditionsList.splice(index,1);
      this.addSubCondition(subconditionsList);
    }
  }

  showConditionValue(index){
    if((index != this.questionConditions.length-1) && this.questionConditions.length>1 )
      return  true;
    else
      return false;
  }

  private _filterGroup(value: string): QuestionGroupDto[] {
    const filterValue = value.toLowerCase();
    return this.groupList.filter(group => group.description.toLowerCase().includes(filterValue));
  }
  private _filterAttribute(value: string): AttributeDto[] {
    return this.attributeList.filter(attribute =>  attribute.attributeName.includes(value));
  }
  
  public _filterSubAttributeList(value: string){
    this.attributeList.filter(attribute =>  attribute.attributeName.includes(value));
    this.subAttributeList = this.attributeList.filter(attribute =>  attribute.attributeName.includes(value));
  }  

  //On tab/focus out of option value field
  onSetOptionVal(option){
    option.questionOptionActionDto[0].value = option.optionValue;
    if(option.optionValue != undefined && option.optionValue != '')
      this.defaultValueList.push(option.optionValue);
    this.createDefaultList()
  }

  //On tab/focus out of attribute field and to add <# #> to the value
  onSetAttributeVal(){
    let attributeVal = this.createquestionformgroup.controls['attribute'].value;
    if(!attributeVal.startsWith("<#") && attributeVal != "")
      this.createquestionformgroup.controls['attribute'].setValue( '<#' + attributeVal + '#>');
  }

  //On tab/focus out of sub attribute fields and to add <# #> to the value
  onSetSubAttributeVal(attribute){
    if(!attribute.attributeName.startsWith("<#") && attribute.attributeName != "")
      attribute.attributeName =  '<#' + attribute.attributeName + '#>';
  }

  onSubmit(){
    if(this.createquestionformgroup.status == "VALID"){
    this.templateQuestion.templateVersionId = this.templateversionid;
    this.templateQuestion.description = this.createquestionformgroup.controls['questionDesc'].value;  
    this.templateQuestion.groupDto = this.createGroupDto(this.createquestionformgroup.controls['groupName'].value);
    this.templateQuestion.sequence = this.createquestionformgroup.controls['sequenceNumber'].value;
    this.templateQuestion.inputType = this.createquestionformgroup.controls['inputType'].value;
    this.templateQuestion.defaultValue = this.createquestionformgroup.controls['defaultValue'].value;

    //Add Sequence number and add attribute dto using attribute Names
    
    this.questionOptions.forEach((element, index) => {
      element.sequence= index+1;
      element.questionOptionActionDto.forEach((optAction, index) => {
        optAction.attribute = this.createAttributeDto(optAction.attribute.attributeName);
      });
      
    });
    this.templateQuestion.questionOptionDto = this.questionOptions;

    //Add Sequence number and add attribute dto using attribute Names
    this.questionConditions.forEach((element, index) => {
      element.sequence= index+1;
      element.questionName=this.templateQuestion.description;
      element.subconditionDtos.forEach((subCondtion, index) => {
        subCondtion.attribute = this.createAttributeDto(subCondtion.attribute.attributeName);
      });
    });
    this.templateQuestion.questionConditionDtos = this.questionConditions;
    this.templateQuestion.attributeDto = this.createAttributeDto(this.createquestionformgroup.controls['attribute'].value);
    this.createAttributeDto(this.createquestionformgroup.controls['attribute'].value);
    if(this.isCreateFlow){
      this.questionService.addNewQuestion(this.templateQuestion).subscribe((data:TemplateQuestionDto)=>{
        this.dialogref.close();
      },() =>{
        
      });
    }else{
      this.questionService.updateQuestion(this.templateQuestion).subscribe((data:TemplateQuestionDto)=>{
        this.dialogref.close();
      },() =>{
        
      });
    }
  }else{
    this.errormessage = "*Please fill all the manadatory fields."
  }
  }

  populateValueFromDto(data,groupDesc,questionId){
    
    this.createquestionformgroup.controls['questionDesc'].setValue(data.description) ;
    this.createquestionformgroup.controls['groupName'].setValue(groupDesc) ;
    this.createquestionformgroup.controls['sequenceNumber'].setValue(data.sequence);
    this.createquestionformgroup.controls['inputType'].setValue(data.inputType);
    if(this.canteditattribute)
      this.createquestionformgroup.controls['inputType'].disable();

    if(data.inputType == 'comboBox' || data.inputType == 'checkBox' || data.inputType == "radio"){
      this.selected = data.defaultValue;
      
    }

    this.createquestionformgroup.controls['defaultValue'].setValue(data.defaultValue);
    this.createquestionformgroup.controls['attribute'].setValue(data.attributeDto.attributeName);

    if(data.inputType != "textfield"){
      this.showOptions = true;
      if(data.inputType === 'checkBox'){
        this.isOptionDisabled = true;

      }
    }

    this.questionOptions = data.questionOptionDto;

    if( data.questionConditionDtos != null){
      this.questionConditions = data.questionConditionDtos;
      
    }else
      this.addCondition("");

     //ordering of subattributes acc to questionOptionActionIds
     if(data.inputType == 'comboBox' || data.inputType === 'radio' || data.inputType == 'checkBox'){
      for(let i = 0 ;i<this.questionOptions.length;i++){
        
        this.questionOptions[i].newflag = false;

        this.questionOptions[i].questionOptionActionDto.sort((a,b)=> {
          if (a.questionOptionActionId > b.questionOptionActionId) return 1;
          if (b.questionOptionActionId > a.questionOptionActionId) return -1;
          return 0;
        });

        this.questionOptions[i].questionOptionActionDto.forEach(questionOptionAction =>{
          questionOptionAction.newflag = false;
        })

      }
    }

    if(data.inputType == 'checkBox'){
    
      this.questionOptions.forEach(option=>{
        this.defaultValueList.push(option.questionOptionActionDto[0].value);
      });

    }else if(data.inputType === 'comboBox' || data.inputType === 'radio'){
      this.questionOptions.forEach(option=>{
        this.defaultValueList.push(option.optionValue);
      })
    }
      
    this.headerText = "Edit Question";
    this.templateQuestion.templateQuestionId = questionId;
  }

  removeDataFromDefaultValue(event){
    
    this.selected = event;
    this.createquestionformgroup.controls['defaultValue'].setValue(undefined);
    this.shouldSubmitForm = false;
    
  }

  changeShouldSubmitFormFlag(event){
    
    this.shouldSubmitForm = true;
  }

  getAttributeName(id){
    var attributeDto = this.attributeList.find(x => x.attributeId == id);
    return attributeDto.attributeName;
  }

  createAttributeDto(attributeName){
    var attributeDto = this.attributeList.find(x => x.attributeName == attributeName);
    if(attributeDto == undefined || attributeDto.attributeName == undefined || attributeDto.attributeName == null){
       attributeDto = new AttributeDto();  
       attributeDto.attributeName = attributeName;
    }
    return attributeDto;
  }

  createGroupDto(groupDesc){
    var groupDto = this.groupList.find(x => x.description == groupDesc);
    if(groupDto == undefined || groupDto.description == undefined || groupDto.description == null){
      groupDto = new QuestionGroupDto();  
      groupDto.description = groupDesc;
      groupDto.sequence = this.groupsequencecount++;
    }
    return groupDto;
  }

  fillAllOptionDataOnInputChange(event){
    this.questionOptions.forEach(questionopt=>{
      if(questionopt.questionOptionActionDto[0].attribute.attributeName != "<#"+this.createquestionformgroup.controls["attribute"].value+"#>"){
        
        questionopt.questionOptionActionDto[0].attribute.attributeName = "<#"+this.createquestionformgroup.controls["attribute"].value+"#>";
      }
    })
  }
}
