import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-court-reset-password',
  templateUrl: './court-reset-password.component.html',
  styleUrls: ['./court-reset-password.component.css']
})
export class CourtResetPasswordComponent implements OnInit {
  userid;
  hide = true;
  resetformgroup:FormGroup;
  errorflag:boolean = false;
  errormessage:string = "";
  roletype;
  successflag = false;
  successmessage = "";

  constructor(private http:HttpClient,private router:Router) { 

    if(!!localStorage.getItem("userdata") 
      && (JSON.parse(localStorage.getItem("userdata"))["roleId"] == 3 || JSON.parse(localStorage.getItem("userdata"))["roleId"] == 4  )
      && localStorage.getItem("isAdmin") == "false"){

    }else{
      
      this.router.navigate(['login']);
    }
   
    if(localStorage.getItem("userdata")!=undefined && localStorage.getItem("userdata")!=""){
      this.userid = +JSON.parse(localStorage.getItem("userdata"))["userId"];
      
    }

     this.resetformgroup = new FormGroup({
      password:new FormControl("",[Validators.required,Validators.minLength(6)]),
      repassword:new FormControl("",[Validators.required,Validators.minLength(6)]),
    });
  }

  ngOnInit() {
  }

  submit(){

    if(this.resetformgroup.controls["password"].status === 'INVALID' || this.resetformgroup.controls["repassword"].status === 'INVALID'){
      this.showErrorMessage("Password should contain atlease 6 characters");
      return;
    }else if(this.resetformgroup.controls["password"].value.trim().length === 0){
      this.showErrorMessage("Enter a valid password ");
      return ;
    }else if(this.resetformgroup.controls["password"].value != this.resetformgroup.controls["repassword"].value){
      this.showErrorMessage("New password and confirmation password does not match.");
      return ;
    }else{
      this.http.post(environment.url + "user/account/updateUserPassword",{"userId":this.userid,"password":this.resetformgroup.controls["password"].value.trim()}).subscribe(
      data => {
        if(data["success"] === true){
         
         this.successmessage = "Password changed successfully"
         this.successflag = true;
         this.errorflag = false;
        }else{
          this.showErrorMessage(data["data"]);   
          
        }
      },
      error => {   
        this.showErrorMessage(error);   
        
      }
    );
    }

  }

  showErrorMessage(message){
    this.errorflag=true;
    this.successflag = false;
    this.errormessage = "*"+message;

  }

  keyDownFunction(event) {
    if(event.keyCode == 13) {
      event.preventDefault();
      this.submit();
    }
  }

}
