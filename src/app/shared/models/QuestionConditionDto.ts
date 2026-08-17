import { QuestionSubconditionDto } from './QuestionSubconditionDto';

export class QuestionConditionDto{
    questionConditionId:number;
    sequence:number;
    questionName:string;
    conditionType:string;
    subconditionDtos:QuestionSubconditionDto[] = [];
}