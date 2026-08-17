import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: [
    '../user/user-auth/user-signup/auth-shared.css',
    './resetpassword.component.css'
  ]
})
export class ResetpasswordComponent implements OnInit {

  p;
  token;
  hidePassword = true;
  hideConfirmPassword = true;
  resetformgroup: FormGroup;
  errorflag = false;
  errormessage = '';
  roletype;
  readonly brandTitle = 'Trusted Digital Notarization for Every Document';
  readonly brandDescription =
    'Complete your entire notarization journey online. From document creation and secure payment to identity verification, ' +
    'live video oath-taking, digital signing, and secure delivery of your notarized document.';
  readonly dashboardPreviewPath = 'assets/auth/dashboard-preview.png';
  readonly trustItems = [
    { icon: 'verified_user', label: 'Court-certified notaries' },
    { icon: 'person_outline', label: 'Identity verification' },
    { icon: 'apps', label: 'QR code verification' }
  ];
  readonly strengthSegments = [0, 1, 2, 3];
  private readonly passwordPattern = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.p = this.route.snapshot.queryParams.p;
    this.token = this.route.snapshot.queryParams.token;
    this.roletype = this.route.snapshot.queryParams.type;

    this.resetformgroup = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.passwordPattern)
      ]),
      repassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });
  }

  ngOnInit() {
  }

  submit() {

    if (this.resetformgroup.controls.password.status === 'INVALID' || this.resetformgroup.controls.repassword.status === 'INVALID') {
      this.showErrorMessage('Use 8+ characters with a number and a symbol.');
      return;
    } else if (this.resetformgroup.controls.password.value.trim().length === 0) {
      this.showErrorMessage('Enter a valid password ');
      return;
    } else if (this.resetformgroup.controls.password.value !== this.resetformgroup.controls.repassword.value) {
      this.showErrorMessage('New password and confirmation password does not match.');
      return ;
    } else {
      this.http.post(environment.url + 'api/auth/setPassword', {
        id: this.p,
        token: this.token,
        password: this.resetformgroup.controls.password.value.trim()
      }).subscribe(
        (data: any) => {
          if (!!data.success) {
            this.router.navigate(['user/signup'], {
              queryParams: { componentType: 'login' }
            });
          } else {
            this.showErrorMessage(data.data);
          }
        },
        error => {
          this.showErrorMessage(error && error.message ? error.message : 'Something went wrong');
        }
      );
    }

  }

  clearError() {
    this.errorflag = false;
    this.errormessage = '';
  }

  showErrorMessage(message: string) {
    this.errorflag = true;
    this.errormessage = '*' + message;

  }

  get passwordControl(): FormControl {
    return this.resetformgroup.get('password') as FormControl;
  }

  get strengthScore(): number {
    const value = this.passwordControl && this.passwordControl.value ? this.passwordControl.value : '';
    if (!value) {
      return 0;
    }
    let score = 0;
    if (value.length >= 8) {
      score++;
    }
    if (value.length >= 12) {
      score++;
    }
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
      score++;
    }
    if (/\d/.test(value)) {
      score++;
    }
    if (/[^A-Za-z0-9]/.test(value)) {
      score++;
    }
    return Math.min(score, 4);
  }

  get strengthLabel(): string {
    switch (this.strengthScore) {
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  }

  keyDownFunction(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }

  goLandingPage() {
    this.router.navigate(['user/signup'], {
      queryParams: { componentType: 'login' }
    });
  }
}
