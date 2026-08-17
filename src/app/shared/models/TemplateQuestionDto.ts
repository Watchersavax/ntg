import { QuestionGroupDto } from './QuestionGroupDto';
import { AttributeDto } from './AttributeDto';
import { QuestionOptionDto } from './QuestionOptionDto';
import { QuestionConditionDto } from './QuestionConditionDto';

export class TemplateQuestionDto{
    templateVersionId:number;  
	description:string;  //question Text
	groupDto:QuestionGroupDto;
	attributeDto:AttributeDto;
	sequence:number;
	inputType:String;
	questionOptionDto:QuestionOptionDto[];
	defaultValue:string;
	questionConditionDtos:QuestionConditionDto[];
	templateQuestionId:string;
}