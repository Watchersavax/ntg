import { QuestionOptionActionDto } from './QuestionOptionActionDto';

export class QuestionOptionDto{
    optionValue:string="";
    sequence:number;
    questionOptionActionDto:QuestionOptionActionDto[] = [];
    newflag:boolean = true;
}