import { Input, Directive } from '@angular/core';

@Directive({   
     selector: '[quest_tag]'   
})  
export class QuestionDirective {  

     @Input('quest_tag') quest_tag:string;

}   