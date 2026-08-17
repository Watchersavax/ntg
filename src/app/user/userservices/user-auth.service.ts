import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginRequestModel } from 'src/app/shared/models/LoginRequestModel';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {

  constructor(private http: HttpClient) { }

  loginIn(loginModal: LoginRequestModel) {
    return this.http.post(environment.url + 'api/auth/signin', loginModal);
  }

  userRegisterRequest(registermodal) {
    return this.http.post(environment.url + 'api/auth/signup', registermodal)
  }

  userForgotRequest(email: string) {
    return this.http.post(environment.url + 'api/auth/resetPassword', email);
  }

  getAllUserTransactions(userId: number, httpparams) {
    return this.http.get(environment.url + 'gettransactions/' + userId, { params: httpparams});
  }

  getRegistrationPrice() {
    return this.http.get(environment.url + 'api/auth/registrationPrice');
  }

  checkUsernameEmailAvailability(registerModel) {
    return this.http.post(environment.url + 'api/auth/checkAvailability', registerModel);
  }

  verifyOTP(otpModel){
    return this.http.post(environment.url + 'api/auth/verifyOTP', otpModel);
  }

  resendEmailOTP(resendOTPModel){
    return this.http.post(environment.url + 'api/auth/resendEmailOTP', resendOTPModel);
  }
}
