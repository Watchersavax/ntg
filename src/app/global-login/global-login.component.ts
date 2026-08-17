import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginRequestModel } from '../shared/models/LoginRequestModel';
import { Router } from '@angular/router';
import { LoginErrorResponse } from '../shared/models/LoginErrorResponse';
import { LoginResponseModel } from '../shared/models/LoginResponseModel';
import { environment } from 'src/environments/environment';
import { UserLoginFlagService } from '../user/userservices/user-login-flag.service';

@Component({
  selector: 'app-global-login',
  templateUrl: './global-login.component.html',
  styleUrls: ['./global-login.component.css']
})
export class GlobalLoginComponent implements OnInit {
  hide = true;
  loginformgroup: FormGroup;
  loginrequestobj = new LoginRequestModel();
  errorflag: boolean = false;
  errormessage: string = '';

  ngOnInit() { }

  constructor(private router: Router, private http: HttpClient, private loginservice: UserLoginFlagService) {

    this.loginformgroup = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

  }

  onSubmit() {
    // Check for validations
    if (
      this.loginformgroup.controls['username'].status === 'INVALID' ||
      this.loginformgroup.controls['username'].value.trim().length === 0 ||
      this.loginformgroup.controls['password'].status === 'INVALID' ||
      this.loginformgroup.controls['password'].value.trim().length === 0
    ) {
      if (this.loginformgroup.controls['password'].status === 'INVALID') {
        this.showErrorMessage('Password should contain 6 characters atleast');
      } else {
        this.showErrorMessage('Please fill mandatory fields');
      }
      return;
    } else {
      this.loginrequestobj.usernameOrEmail = this.loginformgroup.value['username'].trim();
      this.loginrequestobj.password = this.loginformgroup.value['password'].trim();
      // Call backend service to get auth token and save it to localstorage of the browser
      this.sendSiginRequest(this.loginrequestobj);
    }
  }

  sendSiginRequest(loginModal) {
    
    let errordata = new LoginErrorResponse();
    let successdata = new LoginResponseModel();
    this.http.post(environment.url + 'api/auth/signin', loginModal).subscribe(
      (response: LoginResponseModel) => {
        successdata = response;
        if (response.success) {
          // Set data in localStorage of browser

          switch (response.data['roleId']) {
            case 1:
              localStorage.setItem('userdata', '');
              localStorage.setItem('admindata', JSON.stringify(response.data));
              localStorage.setItem('isAdmin', 'true');
              this.loginservice.setLoggedOffFlag();
              this.router.navigate(['/admin', 'dashboard', 'templates']);
              break;

            case 2:
              localStorage.setItem('admindata', '');
              localStorage.setItem('userdata', JSON.stringify(response.data));
              localStorage.setItem('isAdmin', 'false');
              this.loginservice.setLoggedInFlag();
              this.router.navigate(['/user', 'myaccount', 'documents']);
              break;

            case 3:
              localStorage.setItem('admindata', '');
              localStorage.setItem('userdata', JSON.stringify(response.data));
              localStorage.setItem('isAdmin', 'false');
              this.loginservice.setLoggedOffFlag();
              this.router.navigate(['/court', 'registrars']);
              break;

            case 4:
              localStorage.setItem('admindata', '');
              localStorage.setItem('userdata', JSON.stringify(response.data));
              localStorage.setItem('isAdmin', 'false');
              this.loginservice.setLoggedOffFlag();
              this.router.navigate(['/court', 'courtaffidavit']);
          }
        } else {
          this.showErrorMessage(response['error']['error']);
        }
      },
      (error) => {
        errordata = error['error'];
        this.showErrorMessage('Invalid Credentials');
      }
    );
  }

  toggle() {
    this.errorflag = !this.errorflag;
  }

  showErrorMessage(message: string) {
    this.errorflag = true;
    this.errormessage = '*' + message;
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }

}
