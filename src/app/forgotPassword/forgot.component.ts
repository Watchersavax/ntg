import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';

@Component({
  selector: "app-forgot",
  templateUrl: "./forgot.component.html",
  styleUrls: ["./forgot.component.css"]
})
export class ForgotComponent implements OnInit {
  hide = true;
  forgotformgroup:FormGroup;
  errorflag:boolean = false;
  errormessage:string = "";
  success:boolean = false;

  constructor(private router: Router,private http:HttpClient,private loadingscreenservice:LoadingscreenService) {
    this.forgotformgroup = new FormGroup({
      email:new FormControl("",[Validators.required,Validators.email])
    });
  }

  ngOnInit() {}

  onSubmit() {

    //check for validations 
    if (this.forgotformgroup.controls["email"].status === "INVALID") {
      this.toggle("*Please Fill Email");
      return ;
    }else{
      this.forgotRequest(null);
    }

  }

  forgotRequest(registermodal) {
    this.http.post(environment.url + "api/auth/resetPassword",this.forgotformgroup.controls["email"].value.trim()).subscribe(
      (data) => {
        if(data["success"] === true){
          
          this.toggle("");
          //on successfull login of admin route to the dashboard
          this.success = true;
        }else{
          
          this.toggle("*"+data["error"]["error"]);
        }
        
      },
      () => {

      }
    );
  }

  toggle(message){
    this.errorflag = !this.errorflag;
    this.errormessage =""+ message ;
  }

  keyPress(event: any) {
    this.errorflag = false;
}

  keyDownFunction(event) {
    if(event.keyCode == 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
