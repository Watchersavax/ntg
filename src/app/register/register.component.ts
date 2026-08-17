import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SignupRequestModel } from 'src/app/shared/models/SignupRequestModel';
import { SignupResponseModel } from 'src/app/shared/models/SignupResponseModel';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  hide = true;
  registerformgroup: FormGroup;
  registerrequestobj = new SignupRequestModel();
  errorflag = false;
  errormessage = '';

  ngOnInit() { }

  constructor(private router: Router, private http: HttpClient) {

    this.registerformgroup = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      repassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      corporateinfo: new FormControl('')
    });

  }

  onSubmit() {
    // Check for validations
    if (
      this.registerformgroup.controls['firstname'].status === 'INVALID' ||
      this.registerformgroup.controls['lastname'].status === 'INVALID' ||
      this.registerformgroup.controls['password'].status === 'INVALID' ||
      this.registerformgroup.controls['repassword'].status === 'INVALID' ||
      this.registerformgroup.controls['email'].status === 'INVALID' ||
      this.registerformgroup.controls['firstname'].value.trim().length === 0 ||
      this.registerformgroup.controls['lastname'].value.trim().length === 0 ||
      this.registerformgroup.controls['password'].value.trim().length === 0 ||
      this.registerformgroup.controls['repassword'].value.trim().length === 0 ||
      this.registerformgroup.controls['email'].value.trim().length === 0
    ) {
      if (this.registerformgroup.controls['password'].status === 'INVALID' ||
          this.registerformgroup.controls['password'].value.trim().length === 0) {
        this.showErrorMessage('Password should contain 6 characters atleast');
      } else {
        this.showErrorMessage('Please fill mandatory fields');
      }
      return;
    } else {

      if (this.registerformgroup.controls['repassword'].value === this.registerformgroup.controls['password'].value) {

        this.registerrequestobj.username = this.registerformgroup.value['username'];
        this.registerrequestobj.password = this.registerformgroup.value['password'];
        this.registerrequestobj.firstName = this.registerformgroup.value['firstname'];
        this.registerrequestobj.lastName = this.registerformgroup.value['lastname'];
        this.registerrequestobj.email = this.registerformgroup.value['email'];
        this.registerrequestobj.userRole = 'ROLE_USER';

        // Check if user is corporate user or not
        if (this.registerformgroup.controls['corporateinfo'].value.trim().length > 0) {
          // If corporate info is provided
          this.registerrequestobj.corporateInfo = this.registerformgroup.controls['corporateinfo'].value.trim();
        }
        // Call backend service to get auth token and save it to localstorage of the browser
        this.sendSigupRequest(this.registerrequestobj);
      } else {
        this.showErrorMessage("Both passwords didn't match");
        return;
      }
    }

  }

  sendSigupRequest(registermodal) {

    let errordata = new SignupResponseModel();
    let successdata = new SignupResponseModel();

    this.http.post(environment.url + 'api/auth/signup', registermodal).subscribe(
      (data: SignupResponseModel) => {
        if (data.success === true) {
          successdata = data;
          this.router.navigate(['/login']);
        } else {
          this.showErrorMessage(data.error.message);
        }
      },
      (error) => {
        
        errordata = error['error'];
        this.showErrorMessage(errordata['message'])
      }
    );
  }

  showErrorMessage(message) {
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
