import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { UserdataService } from '../userservices/userdata.service';
import { QuestionService } from 'src/app/admin/dashboard/manageTemplates/Templateservices/question.service';
import { TableRows } from 'src/app/shared/models/TableRows';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserauthComponent } from '../user-auth/userauth-dialog/userauth.component';
import { MatDialog } from '@angular/material';
import { DeponentComponent } from '../deponent/deponent.component';
import { UserDetails } from '../user-models/UserDetails';
import { TemplateHtmlSanitizerService } from 'src/app/shared/security/template-html-sanitizer.service';

@Component({
  selector: 'app-template-description-page',
  templateUrl: './template-description-page.component.html',
  styleUrls: ['./template-description-page.component.css']
})
export class TemplateDescriptionPageComponent implements OnInit {

  templateid;
  descriptionPageHtml;
  selectedTemplateobj = new TableRows();
  htmlvalue;
  isSignedIn = false;
  userType: string;
  isAgent= false;
  agentId: number;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private userdataservice: UserdataService,
    private templatedataservice: QuestionService,
    private dialog: MatDialog,
    private templateHtmlSanitizer: TemplateHtmlSanitizerService) {
       
    }

  ngOnInit() {

    this.userType = !!localStorage.getItem('isAdmin') && localStorage.getItem('isAdmin') == 'true' ? 'admindata' : 'userdata';
    if (!!localStorage.getItem(this.userType)) {
      this.isSignedIn = true;
      let userData = new UserDetails();
      if (!!localStorage.getItem('userdata')) {
        const userData = JSON.parse(localStorage.getItem('userdata'));
        this.isAgent = userData.isAgent;
        this.agentId = userData.userId;
      }
    }

    let userSubscription: Subscription;
    this.templateid = JSON.parse(this.route.snapshot.params["templateId"]);
    userSubscription = this.route.params.subscribe(
      (params: Params) => {
           this.templateid = JSON.parse(this.route.snapshot.params["templateId"]);
           this.dataInitialization()
    });

  }

  dataInitialization(){

    this.userdataservice.fetchTemplateObjectById(this.templateid).subscribe(data => {
        
        if (data["success"] === true) {
          this.selectedTemplateobj = data["data"];
          this.descriptionPageHtml = this.templateHtmlSanitizer.sanitize(
            this.selectedTemplateobj.publishedTemplateVersion.templateVersionDescriptionHtml
          );
          setTimeout(()=>{
            let node = document.createElement('div');
            node.appendChild(this.templateHtmlSanitizer.sanitizeToFragment(
              this.selectedTemplateobj.publishedTemplateVersion.templateVersionValue+
              "<style>"+this.selectedTemplateobj.publishedTemplateVersion.templateVersionCss+"</style>"
            ));
            node.style.width = "200.63px";
            node.style.height = "200.63px"
            node.style.display= "flex";
            node.style.flexFlow = "row wrap";
            node.style.fontSize = "8px";
            node.style.border = "0px";
            
            let allspanarray = node.getElementsByTagName('span');
            for(let i=0;i<allspanarray.length;i++){
              allspanarray[i].style.fontSize = "8px";
            }
            let alldivarray = node.getElementsByTagName('div');
            for(let i=0;i<alldivarray.length;i++){
              alldivarray[i].style.border = "0px";
            }

            document.getElementById("affidavitcard").appendChild(node);

            let templatespanelementarray: NodeListOf<HTMLElement> = document.getElementById("affidavitcard").querySelectorAll(
              "span[cust_tag]"
            );
            for (let i = 0; i < templatespanelementarray.length; i++) {
              templatespanelementarray[i].innerText = "___________ ";
              templatespanelementarray[i].style.borderBottom = "0px";
            }
          },0)
        }
      },() =>{
      
      });
  }

  filltemplate(){
    if(this.isSignedIn){
      if(this.isAgent){
      const dialogRef = this.dialog.open(DeponentComponent,{data:{agentId: this.agentId}}); 
      dialogRef.afterClosed().subscribe((data: string) => {
        if (data === 'Close') {
        }
        else{
          this.router.navigate(['/user','filltemplate',this.templateid,data]);
        }
        });
      }
      else{
         this.router.navigate(['/user','filltemplate',this.templateid]);
      }
    }
    else{
      const dialogRef = this.dialog.open(UserauthComponent);
      dialogRef.afterClosed().subscribe(data => {
        if (data == 'Success') {
          if (localStorage.getItem('userdata') != '' || localStorage.getItem('admindata') != '') {
            this.isSignedIn = true;
            this.router.navigate(['/user','filltemplate',this.templateid]);
          }
        }
      });
    }
  }
}
