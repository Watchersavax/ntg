import { ParagraphCondition } from './ParagraphCondition';

export class ParagraphConditionResponse{
    statusCode;
    total;
    success;
    data:ParagraphSubconditionResponse;
}

export class ParagraphSubconditionResponse{
    paragraphConditionId;
    templateVersionId;
    paragraphSubcondition:ParagraphCondition[]=[];
}