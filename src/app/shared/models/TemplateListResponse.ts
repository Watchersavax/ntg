import { Template, NewTemplate } from './Template';

export class TemplateListResponse{
    success:boolean;
    total:number;
    data:Template[];
  }

  export class NewTemplateListResponse{
    success:boolean;
    total:number;
    data:NewTemplate[];
  }
  
  