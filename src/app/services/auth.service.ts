import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserLoginFlagService } from '../user/userservices/user-login-flag.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router,private userLoginFlagService: UserLoginFlagService) { }

  logout() {
    localStorage.setItem('userdata', '');
    this.userLoginFlagService.setLoggedOffFlag();
    localStorage.setItem('admindata', '');
    localStorage.setItem('isAdmin', 'false');
    this.router.navigate(['/user/home']);
  }
}
