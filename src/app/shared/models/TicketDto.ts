import { TicketCategory } from './TicketCategoryDto';
import { TicketActionDto } from './TicketActionDto';
import { UserDetails } from 'src/app/user/user-models/UserDetails';

export class TicketDto{

   	tiId:number;
	
	tiCa:TicketCategory;
	
	tiOwId:number;
	
	tiCrda:Date;

	tiCrdast:String;

	tiOwDe:UserDetails;
	
	tiAr:boolean;
	
	tiAcLi:TicketActionDto [] = [];
	
	ticketStatus:string ;
    
}