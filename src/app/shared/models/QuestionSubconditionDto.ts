import { AttributeDto } from './AttributeDto';

export class QuestionSubconditionDto{
    attribute:AttributeDto = new AttributeDto();	
	attributeValue:string;
	operatorType:string;
	conditionType:string;
	value:string;
}