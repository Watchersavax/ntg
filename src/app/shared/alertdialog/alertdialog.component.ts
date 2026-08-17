import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CourtDataService } from 'src/app/court/courtdataservices/court-data.service';

@Component({
  selector: 'app-alertdialog',
  templateUrl: './alertdialog.component.html',
  styleUrls: ['./alertdialog.component.css']
})
export class AlertdialogComponent implements OnInit {

  actionname:string;
  message:string;
  onlycloseaction = false;
  showcourtflag = false;
  secondmessage:string ;
  affidavitId;
  fetchcourtnamelist:string[] = [] ;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  public dialogRef: MatDialogRef<AlertdialogComponent> , private courtDataservice:CourtDataService) {
    dialogRef.disableClose = true;
    this.actionname = data["actionname"];
    this.message = data["message"]; 

    if(this.message.indexOf("<#b>Reason") >= 0){

      this.secondmessage = this.message.substring(this.message.indexOf("<#b>Reason")+4,this.message.length);
      this.message = this.message.substring(0,this.message.indexOf("<#b>Reason"));
    
    }

    if(data["onlyclose"] != undefined && data["onlyclose"] != null && data["onlyclose"] === false){
      this.onlycloseaction = false;
    }else{
      this.onlycloseaction = true;
    }
    if(data["affidavitId"] != undefined && data["affidavitId"] != null){
      this.affidavitId = +data["affidavitId"];
      this.fetchCourtNamesToWhichUserCanGo(this.affidavitId);
    }

    if(!!data["courtList"]){
      this.fetchcourtnamelist = data["courtList"];
      this.showcourtflag = true;
    }

  }

  ngOnInit() {}

  fetchCourtNamesToWhichUserCanGo(affidavitId){
    
    this.courtDataservice.getAffidavitHtmlValueByCourtAndAffidavitId(affidavitId,0).subscribe(data=>{
      
      if(!data["success"]){
        this.actionname = "Court names";
        this.message = data["error"]["error"];
        let namelist = this.message.substring(this.message.indexOf('[')+1,this.message.indexOf(']'));
        this.fetchcourtnamelist = namelist.split(',');
        if(this.message.startsWith('This affidavit doesnt belong to any court')){
          this.message = "This affidavit doesnt belong to any court";
        }else{
          this.message = "You can approve your affidavit at any of below listed courts "
          this.showcourtflag = true;
        }
      }
    },() =>{
      
    })
  }
}
