import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserLoginFlagService } from '../user/userservices/user-login-flag.service';
import { UserDataService } from '../admin/dashboard/manageUsers/UserServices/user-data.service';
import { AdminPermission } from '../admin/dashboard/manageUsers/userModels/AdminPermission';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private http: HttpClient, private userLoginFlagService: UserLoginFlagService,private userDataService: UserDataService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (localStorage.getItem('isAdmin') == 'true' && !!localStorage.getItem('admindata') &&
      (JSON.parse(localStorage.getItem('admindata'))['roleId'] === 1)) {

      const token = JSON.parse(localStorage.getItem('admindata'))['authenticationToken'];
      const userId = JSON.parse(localStorage.getItem('admindata'))['userId'];

      this.http.post(environment.url + 'api/auth/validateAuthToken', token)
        .subscribe(
          (response: any) => {
            if (response.success) {
              if(state.url==='/admin/dashboard/admins'||state.url==='/admin/dashboard/templates'||state.url==='/admin/dashboard/registrars'
              ||state.url==='/admin/dashboard/users'){
              this.userDataService.getAdminPermissionByUserId(userId) .subscribe((response: any) => {
                if (response.success) {
                 let adminPermission = new AdminPermission();
                 adminPermission=response.data;
                 if(state.url==='/admin/dashboard/admins' && adminPermission.adminManagement){
                  return true;
                 } else if(state.url==='/admin/dashboard/templates' && adminPermission.templateManagement){
                  return true;
                 } else if(state.url==='/admin/dashboard/registrars' && adminPermission.registrarManagement){
                  return true;
                 } else if(state.url==='/admin/dashboard/users' && adminPermission.userManagement){
                  return true;
                 }else{
                  if(adminPermission.templateManagement){
                    this.router.navigate(['/admin/dashboard/templates']);
                  } else if(adminPermission.userManagement){
                    this.router.navigate(['/admin/dashboard/users']);
                  } else if(adminPermission.adminManagement){
                    this.router.navigate(['/admin/dashboard/admins']);
                  } else if(adminPermission.registrarManagement){
                    this.router.navigate(['/admin/dashboard/registrars']);
                  }else{
                    this.router.navigate(['/admin/dashboard/manageapp']);
                  }
                  return false;
                 }
                } 
              }, () => {
              
              });
            }else{
                return true;
            }
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
