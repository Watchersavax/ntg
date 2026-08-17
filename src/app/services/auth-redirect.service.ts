import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectService {

  constructor(private router: Router) { }

  redirectAuthenticatedUserToStart(): boolean {
    const userData = this.getAuthenticatedUserData();
    if (!userData || !userData.roleId) {
      return false;
    }

    this.navigateToAuthenticatedStart(userData);
    return true;
  }

  private getAuthenticatedUserData(): any {
    const adminData = this.readStoredUserData('admindata');
    if (adminData && adminData.roleId) {
      return adminData;
    }

    return this.readStoredUserData('userdata');
  }

  private readStoredUserData(storageKey: string): any {
    const storedValue = localStorage.getItem(storageKey);
    if (!storedValue) {
      return null;
    }

    try {
      return JSON.parse(storedValue);
    } catch {
      return null;
    }
  }

  private navigateToAuthenticatedStart(userData: any) {
    switch (Number(userData.roleId)) {
      case 1:
        this.router.navigate(['/admin', 'dashboard', 'templates']);
        break;
      case 2:
        this.router.navigate(['/user', 'home', 'card', 'templist']);
        break;
      case 3:
        this.router.navigate(['/court', 'registrars']);
        break;
      case 4:
        this.router.navigate(['/court', 'dashboard']);
        break;
      default:
        this.router.navigate(['/user', 'home', 'card', 'templist']);
        break;
    }
  }
}
