import { AttributeDto } from './AttributeDto';

export class QuestionOptionActionDto{
    attribute:AttributeDto = new AttributeDto();
    questionOptionActionId:number;
    value:string;
    newflag:boolean = true;
}