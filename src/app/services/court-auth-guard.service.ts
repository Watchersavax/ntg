import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserLoginFlagService } from '../user/userservices/user-login-flag.service';

@Injectable({
  providedIn: 'root'
})
export class CourtAuthGuardService implements CanActivate {

  constructor(private router: Router, private http: HttpClient, private userLoginFlagService: UserLoginFlagService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (localStorage.getItem('isAdmin') == 'false' && !!localStorage.getItem('userdata') &&
        (JSON.parse(localStorage.getItem('userdata'))['roleId'] === 4)) {

      const token = JSON.parse(localStorage.getItem('userdata'))['authenticationToken'];
      this.http.post(environment.url + 'api/auth/validateAuthToken', token)
      .subscribe(
        (response: any) => {
          if (response.success) {
            return true;
          } else {
            this.resetUserData();
          }
        },
        () => {
          
          this.resetUserData();
        }
      );
    } else {
      this.resetUserData();
    }
    // you can save redirect url so after authing we can move them back to the page they requested
    return true;
  }

  resetUserData() {
    localStorage.setItem('userdata', '');
    localStorage.setItem('admindata', '');
    localStorage.setItem('isAdmin', 'false');
    this.userLoginFlagService.setLoggedOffFlag();
    this.router.navigate(['/user', 'home']);
  }
}