import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactUsAndTicketService {

  //fetch data from backend

   urls:string = environment.url + "comm/ticket/"

  constructor(private http:HttpClient) {
    
   }

   createTicket(createTicketrequest){
    return this.http.post(this.urls+"create",createTicketrequest);
   }

   getAllTicketCategory(){
       return this.http.get(this.urls+"allcategories");
   }

   getAllTicketsByUserId(userid,httpparams:HttpParams,roleId,contactusFlag){

       return this.http.get(this.urls+"all/"+userid+"/"+roleId+"/"+contactusFlag , {params:httpparams});
   }

   takeActionOnTicket(ticketaction,roleId){
     return this.http.post(this.urls+"takeAction/"+roleId,ticketaction);
   }
 
}
