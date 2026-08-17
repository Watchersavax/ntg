import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { LoadingscreenService } from '../services/loadingscreen.service';
import { Loginresponseutil } from '../shared/models/Loginresponseutil';

@Component({
  selector: 'app-court',
  templateUrl: './court.component.html',
  styleUrls: ['./court.component.css']
})
export class CourtComponent implements OnInit {

  displayname: string;
  userData: Loginresponseutil;
  roleId;

  constructor(private route: Router, private loadingservice: LoadingscreenService) {

    if (!!localStorage.getItem('userdata') && localStorage.getItem('isAdmin') == 'false'
        && (JSON.parse(localStorage.getItem('userdata'))['roleId'] == 3
        || JSON.parse(localStorage.getItem('userdata'))['roleId'] == 4)) {
      this.userData = JSON.parse(localStorage.getItem('userdata'));
      this.displayname = this.userData['userName'];
      this.roleId = this.userData['roleId'];
    }

    this.route.events.subscribe((routerEvent: Event) => {

      if (routerEvent instanceof NavigationStart) {
        this.loadingservice.startLoading();
      }

      if (routerEvent instanceof NavigationEnd) {
        this.loadingservice.stopLoading();
      }

      if (routerEvent instanceof NavigationError) {
        this.loadingservice.stopLoading();
      }

      if (routerEvent instanceof NavigationCancel) {
        this.loadingservice.stopLoading();
      }

    });
  }

  ngOnInit() {

  }

  editPersonalDetials() {
    this.route.navigate(['/court', 'personal']);
  }

  changePassword() {
    this.route.navigate(['/court', 'resetpass']);
  }

  goToDashboard() {
    if (this.roleId == 3) {
      this.route.navigate(['/court/', 'registrars'])
    } else {
      this.route.navigate(['/court/', 'dashboard'])
    }
  }

  goToHelp() {
    this.route.navigate(['/user', 'help']);
  }

  logout() {
    localStorage.setItem('userdata', '');
    localStorage.setItem('activated', 'false');
    this.route.navigate(['/user/home']);
  }

  goToContactus() {
    if (this.roleId == 3) {
      this.route.navigate(['/court', 'statecontactus']);
    } else {
      this.route.navigate(['/court', 'courtcontactus']);
    }
  }

  loadLoginData() {
    this.userData = JSON.parse(localStorage.getItem('userdata'));
  }

}
