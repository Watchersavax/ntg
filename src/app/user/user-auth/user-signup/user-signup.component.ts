import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { LoginRequestModel } from "src/app/shared/models/LoginRequestModel";
import { LoginResponseModel } from "src/app/shared/models/LoginResponseModel";
import { UserdataService } from "../../userservices/userdata.service";
import { SignupRequestModel } from "src/app/shared/models/SignupRequestModel";
import { SignupResponseModel } from "src/app/shared/models/SignupResponseModel";
import { UserLoginFlagService } from "../../userservices/user-login-flag.service";
import { ActivatedRoute, Router } from "@angular/router";
import { UserAuthService } from "../../userservices/user-auth.service";
import { RegistrationPrice } from "src/app/shared/models/RegistrationPrice";
import { OTPRequest } from "src/app/shared/models/OTPRequest";
import { AlertdialogComponent } from "src/app/shared/alertdialog/alertdialog.component";
import { MatDialog, MatDialogRef } from "@angular/material";
import { AccountTypeOption, TrustItem } from "./auth.models";
import { AuthRedirectService } from "src/app/services/auth-redirect.service";

@Component({
  selector: "app-user-signup",
  templateUrl: "./user-signup.component.html",
  styleUrls: ["./user-signup.component.css", "./auth-shared.css"],
})
export class UserSignupComponent implements OnInit, OnDestroy {
  loginFormGroup: FormGroup;
  loginRequestModel = new LoginRequestModel();
  errorFlag = false;
  errorMessage = "";
  componentType = "login";
  forgotFormGroup: FormGroup;
  registerFormGroup: FormGroup;
  otpVerificationForm: FormGroup;
  registerRequestModel = new SignupRequestModel();
  success = false;
  isCorporate = false;
  isAgent = false;
  registrationPriceModel = new RegistrationPrice();
  otpRequest = new OTPRequest();
  proceedToPayment = false;
  emailResendOTP = 0;
  resendDisable = false;
  resendTimer = 60;
  interval;
  isBtnDisable = true;
  userRestrictedUrls = ["user/filltemplate", "user/edittemplate"]; // No admin must login when on these urls.
  readonly defaultBrandTitle = "Trusted Digital Notarization for Every Document";
  readonly defaultBrandDescription =
    "Complete your entire notarization journey online. From document creation and secure payment to identity verification, live video oath-taking, digital signing, and secure delivery of your notarized document.";
  readonly dashboardPreviewPath = "assets/auth/dashboard-preview.png";
  readonly certificatePreviewPath = "assets/auth/certificate-preview.png";
  readonly trustItems: TrustItem[] = [
    { icon: "verified_user", label: "Court-certified notaries" },
    { icon: "person_outline", label: "Identity verification" },
    { icon: "apps", label: "QR code verification" },
  ];
  readonly accountTypeOptions: AccountTypeOption[] = [
    {
      id: "individual",
      formType: 3,
      label: "Individual",
      pillLabel: "Individual account",
      description:
        "I want to create, notarize and manage my personal documents.",
      icon: "person_outline",
      brandTitle: this.defaultBrandTitle,
      brandDescription: this.defaultBrandDescription,
      formSubtitle:
        "Fill in your details to start notarizing your personal documents.",
    },
    {
      id: "corporate",
      formType: 1,
      label: "Corporate",
      pillLabel: "Corporate account",
      description:
        "I represent a business or organization and need notarization services.",
      icon: "business",
      brandTitle: "Notarization built for your business.",
      brandDescription:
        "Sign in to manage notarization for your organization - audit trails included for every document.",
      formSubtitle:
        "Tell us about your organization to set up your corporate workspace.",
    },
    {
      id: "agent",
      formType: 2,
      label: "Agent",
      pillLabel: "Agent account",
      description:
        "I am an authorized agent helping clients with their notarization needs.",
      icon: "people_outline",
      brandTitle: "Serve your clients, verified every time.",
      brandDescription:
        "Sign in to manage notarization on behalf of your clients, securely and independently verifiable.",
      formSubtitle:
        "Set up your agent profile to start helping clients with notarization.",
    },
  ];
  selectedAccountType: AccountTypeOption = this.accountTypeOptions[0];
  formType: number = 3;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userdataservice: UserdataService,
    private userLoginFlagService: UserLoginFlagService,
    private userAuthService: UserAuthService,
    private authRedirectService: AuthRedirectService,
    private changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog
  ) {
    this.loginFormGroup = new FormGroup({
      username: new FormControl("", Validators.required),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.registerFormGroup = new FormGroup({
      username: new FormControl("", Validators.required),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
      repassword: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
      email: new FormControl("", [Validators.required, Validators.email,Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]),
      firstname: new FormControl("", Validators.required),
      lastname: new FormControl("", Validators.required),
      mobile: new FormControl("", [
        Validators.required,
        Validators.pattern("[0-9]{10}"),
      ]),
      cac: new FormControl("", [
        Validators.pattern("[A-Za-z0-9]*"),
        Validators.minLength(8),
      ]),
      isCorporate: new FormControl(false),
      isAgent: new FormControl(false),
      corporateInfo: new FormControl(""),
    }, { validators: this.mustMatch('password', 'repassword') });
    this.forgotFormGroup = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
    });

    this.otpVerificationForm = new FormGroup({
      emailOtp: new FormControl(""),
    });

    this.route.queryParamMap.subscribe((param: any) => {
      const parameter = param["params"];
      this.componentType = parameter.componentType || "login";
      this.changeRegisterForm(Number(parameter.formType || 3));
    });
  }
  ngOnInit() {
    if (this.authRedirectService.redirectAuthenticatedUserToStart()) {
      return;
    }
    this.getRegistrationPrice();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  getRegistrationPrice() {
    this.userAuthService.getRegistrationPrice().subscribe((response: any) => {
      if (response.success) {
        this.registrationPriceModel = response.data;
      }
    });
  }

  onLoginSubmit() {
    // Check for validations
    if (
      this.loginFormGroup.controls["username"].status === "INVALID" ||
      this.loginFormGroup.controls["username"].value.trim().length === 0 ||
      this.loginFormGroup.controls["password"].status === "INVALID" ||
      this.loginFormGroup.controls["password"].value.trim().length === 0
    ) {
      if (this.loginFormGroup.controls["password"].status === "INVALID") {
        this.showErrorMessage("Password should contain 6 characters atleast");
      } else {
        this.showErrorMessage("Please fill mandatory fields");
      }
      return;
    } else {
      this.loginRequestModel.usernameOrEmail =
        this.loginFormGroup.value["username"].trim();
      this.loginRequestModel.password =
        this.loginFormGroup.value["password"].trim();
      this.loginRequestModel.remember = false;
      // Call backend service to get auth token and save it to localstorage of the browser
      this.signIn(this.loginRequestModel);
    }
  }

  signIn(loginRequestModel: LoginRequestModel) {
    this.userAuthService.loginIn(loginRequestModel).subscribe(
      (response: LoginResponseModel) => {
        if (response.success) {
          if (!this.permittedToContinue(response.data.roleId)) {
            return;
          }
          // Set data in localStorage of browser
          switch (response.data.roleId) {
            case 1:
              localStorage.setItem("userdata", "");
              localStorage.setItem("admindata", JSON.stringify(response.data));
              localStorage.setItem("isAdmin", "true");
              this.userLoginFlagService.setLoggedOffFlag();
              this.router.navigate(["/admin", "dashboard", "templates"]);
              break;

            case 2:
              localStorage.setItem("admindata", "");
              localStorage.setItem("userdata", JSON.stringify(response.data));
              localStorage.setItem("isAdmin", "false");
              this.userLoginFlagService.setLoggedInFlag();
              this.router.navigate(["/user/home/card/templist"]);
              break;

            case 3:
              localStorage.setItem("admindata", "");
              localStorage.setItem("userdata", JSON.stringify(response.data));
              localStorage.setItem("isAdmin", "false");
              this.userLoginFlagService.setLoggedOffFlag();
              this.router.navigate(["/court", "registrars"]);
              break;

            case 4:
              localStorage.setItem("admindata", "");
              localStorage.setItem("userdata", JSON.stringify(response.data));
              localStorage.setItem("isAdmin", "false");
              this.userLoginFlagService.setLoggedOffFlag();
              this.router.navigate(["/court", "dashboard"]);
              break;
          }
        } else {
          this.showErrorMessage("Incorrect Username/Password");
        }
      },
      () => {
        this.showErrorMessage("Something went wrong");
      }
    );
  }

  /**
   * Only General/Business User are permitted to continue login at userRestrictedUrls.
   *
   * @param roleId: number
   * @returns boolean
   */
  private permittedToContinue(roleId: number) {
    let permitted = true;
    let invalidUrlForAdmin = false;
    const currentUrl = this.router.url;
    for (const userRestrictedUrl of this.userRestrictedUrls) {
      if (currentUrl.includes(userRestrictedUrl)) {
        invalidUrlForAdmin = true;
        break;
      }
    }
    if (invalidUrlForAdmin && roleId !== 2) {
      this.showErrorMessage(
        "You can only login as General/Business Firm User while filling affidavit ."
      );
      permitted = false;
    }
    return permitted;
  }

  // For register request
  onRegisterSubmit() {
    // Check for validations
    if (
      (!this.isCorporate &&
        (this.registerFormGroup.controls["firstname"].status === "INVALID" ||
          this.registerFormGroup.controls["lastname"].status === "INVALID" ||
          this.registerFormGroup.controls["firstname"].value.trim().length ===
            0 ||
          this.registerFormGroup.controls["lastname"].value.trim().length ===
            0)) ||
      this.registerFormGroup.controls["password"].status === "INVALID" ||
      this.registerFormGroup.controls["repassword"].status === "INVALID" ||
      this.registerFormGroup.controls["email"].status === "INVALID" ||
      this.registerFormGroup.controls["mobile"].status === "INVALID" ||
      this.registerFormGroup.controls["password"].value.trim().length === 0 ||
      this.registerFormGroup.controls["repassword"].value.trim().length === 0 ||
      this.registerFormGroup.controls["email"].value.trim().length === 0 ||
      this.registerFormGroup.controls["mobile"].value.trim().length === 0 ||
      (this.isCorporate === true &&
        (!this.registerFormGroup.controls.corporateInfo.value ||
          this.registerFormGroup.controls["cac"].status === "INVALID"))
      // } else
    ) {
      if (
        this.registerFormGroup.controls["password"].status === "INVALID" ||
        this.registerFormGroup.controls["password"].value.trim().length === 0
      ) {
        this.showErrorMessage("Password should contain 6 characters atleast");
      } else if (this.isCorporate === true) {
        if (!this.registerFormGroup.controls.corporateInfo.value) {
          this.showErrorMessage("Please provide your Company Name.");
        } else if (
          this.registerFormGroup.controls["cac"].status === "INVALID"
        ) {
          this.showErrorMessage("Please provide your CAC Number");
        }
      } else if (
        this.isCorporate &&
        this.registerFormGroup.controls["cac"].status === "INVALID"
      ) {
        this.showErrorMessage("Please provide your CAC Number");
      } else {
        this.showErrorMessage("Please fill mandatory fields");
      }
      this.isBtnDisable = true;
      return;
    } else {
      if (
        this.registerFormGroup.controls["repassword"].value ===
        this.registerFormGroup.controls["password"].value
      ) {
        this.registerRequestModel.username =
          this.registerFormGroup.value["username"];
        this.registerRequestModel.password =
          this.registerFormGroup.value["password"];
        this.registerRequestModel.firstName =
          this.registerFormGroup.value["firstname"];
        this.registerRequestModel.lastName =
          this.registerFormGroup.value["lastname"];
        this.registerRequestModel.email = this.registerFormGroup.value["email"];
        this.registerRequestModel.mobile =
          "+234" + this.registerFormGroup.value["mobile"];
        this.registerRequestModel.isCorporate = this.isCorporate;
        this.registerRequestModel.corporateInfo = "";
        this.registerRequestModel.registrationPrice =
          this.registrationPriceModel.user;
        this.registerRequestModel.isAgent = this.isAgent;
        this.registerRequestModel.cacNumber =
          this.registerFormGroup.value["cac"];
        if (this.isCorporate) {
          this.registerRequestModel.corporateInfo =
            this.registerFormGroup.value["corporateInfo"];
          this.registerRequestModel.registrationPrice =
            this.registrationPriceModel.firm;
        }
        this.isBtnDisable = false;
        this.checkUsernameEmailAvailability();
      } else {
        this.isBtnDisable = true;
        this.showErrorMessage("Both passwords did not match!");
        return;
      }
    }
  }

  checkUsernameEmailAvailability() {
    this.userAuthService
      .checkUsernameEmailAvailability(this.registerRequestModel)
      .subscribe(
        (response: any) => {
          if (response.success) {
            this.otpVerification();
            this.startTimer();
          } else {
            let errorMessage = "Something went wrong!";
            if (response.error.status !== "500") {
              errorMessage = response.error.error;
            }
            this.showErrorMessage(errorMessage);
          }
        },
        () => {
          this.showErrorMessage("Something went wrong!");
        }
      );
  }

  onVerifyOTPSubmit() {
    const emailOtp = this.otpVerificationForm.controls["emailOtp"].value || "";
    if (emailOtp.length === 0 || emailOtp.length < 6) {
      this.showErrorMessage("Enter valid Email OTP");
      return;
    } else {
      this.otpRequest.email = this.registerRequestModel.email;
      this.otpRequest.emailOTP = emailOtp;

      this.verifyOtp();
    }
  }

  verifyOtp() {
    this.userAuthService.verifyOTP(this.otpRequest).subscribe(
      (response: any) => {
        if (response.success) {
          this.errorFlag = false;
          this.signUp(this.registerRequestModel);
        } else {
          let errorMessage = "Something went wrong!";
          if (response.error.status !== "500") {
            errorMessage = response.error.error;
          }
          this.showErrorMessage(errorMessage);
        }
      },
      () => {
        this.showErrorMessage("Something went wrong!");
      }
    );
  }

  resendEmailOTP() {
    if (!this.resendDisable) {
      return;
    }

    if (this.emailResendOTP < 6) {
      this.startTimer();
      this.userAuthService.resendEmailOTP(this.registerRequestModel).subscribe(
        (response: any) => {
          if (response.success) {
            this.emailResendOTP++;
          } else {
            let errorMessage = "Something went wrong!";
            if (response.error.status !== "500") {
              errorMessage = response.error.error;
            }
            this.showErrorMessage(errorMessage);
          }
        },
        () => {
          this.showErrorMessage("Something went wrong!");
        }
      );
    } else {
      this.maxOTPlimit();
    }
  }

  onRegisterEvent(paymenntDetailId: number) {
    this.registerRequestModel.paymentDetailId = paymenntDetailId;
    this.signUp(this.registerRequestModel);
  }

  editRegistrationDetails() {
    this.proceedToPayment = false;
  }

  signUp(registerModel: SignupRequestModel) {
    this.userdataservice.userRegisterRequest(registerModel).subscribe(
      (response: SignupResponseModel) => {
        if (response.success) {
          this.login();
          this.changeDetectorRef.detectChanges();
          if (registerModel.isAgent) {
            this.openAlertDialogBox(
            'Contact Admin',
            'For activation, please contact the admin.',
            true,
            null
          );
         } 
        } else {
          this.showErrorMessage(response.error.message);
        }
      },
      (error: SignupResponseModel) => {
        this.showErrorMessage(error.error["message"]);
      }
    );
  }

  openAlertDialogBox(actionname: string, message: string, onlyclose, affidavitId): MatDialogRef<AlertdialogComponent>{
    const dialogRef = this.dialog.open(AlertdialogComponent, {
        data: { actionname, message, onlyclose, affidavitId }
    });
    return dialogRef;
}

  onForgotSubmit() {
    // Check for validations
    if (this.forgotFormGroup.controls["email"].status === "INVALID") {
      this.togglewithmessage("*Please Fill Email");
      return;
    } else {
      this.forgotRequest();
    }
  }

  forgotRequest() {
    this.userdataservice
      .userForgotRequest(this.forgotFormGroup.controls["email"].value.trim())
      .subscribe(
        (response: any) => {
          if (response.success) {
            this.togglewithmessage("");
            this.success = true;
          } else {
            this.togglewithmessage("*" + response.error["error"]);
          }
        },
        () => {
          
        }
      );
  }

  togglewithmessage(message: string) {
    this.errorFlag = !this.errorFlag;
    this.errorMessage = "" + message;
  }

  toggle() {
    this.errorFlag = !this.errorFlag;
  }

  toggleUserType() {
    this.isCorporate = !this.isCorporate;
    if (this.isCorporate) {
      this.registerRequestModel.registrationPrice =
        this.registrationPriceModel.firm;
      this.isAgent = false;
    } else {
      this.registerRequestModel.registrationPrice =
        this.registrationPriceModel.user;
    }
  }
  toggleAgent() {
    this.isAgent = !this.isAgent;
    if (this.isAgent) {
      this.isCorporate = false;
    }
  }

  login() {
    this.componentType = "login";
    this.errorFlag = false;
    this.errorMessage = "";
  }

  signup() {
    this.registerFormGroup.reset();
    this.componentType = "account-type";
    this.errorFlag = false;
    this.errorMessage = "";
    this.changeRegisterForm(3);
  }

  forgot() {
    this.componentType = "forgot";
    this.errorFlag = false;
    this.errorMessage = "";
  }

  maxOTPlimit() {
    this.componentType = "maxResendOTP";
    this.errorFlag = false;
    this.errorMessage = "";
  }

  otpVerification() {
    this.componentType = "otpVerification";
    this.errorFlag = false;
    this.errorMessage = "";
  }

  editEmailORMobile() {
    this.emailResendOTP = 0;
    this.componentType = "register";
    this.errorFlag = false;
    this.errorMessage = "";
    this.otpVerificationForm.reset();
  }

  startTimer() {
    this.clearTimer();
    this.resendDisable = false;
    this.resendTimer = 60;
    this.interval = setInterval(() => {
      if (this.resendTimer > 1) {
        this.resendTimer--;
      } else {
        this.resendTimer = 0;
        this.resendDisable = true;
        this.clearTimer();
      }
    }, 1000);
  }

  clearTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  close() {
  }

  showErrorMessage(message: string) {
    
    this.errorFlag = true;
    this.errorMessage = "*" + message;
  }

  showMessage(message: string) {
    
    this.errorFlag = false;
    this.errorMessage = "*" + message;
  }

  keyPress(event?: any) {
    this.errorFlag = false;
  }

  selectAccountType(option: AccountTypeOption) {
    this.changeRegisterForm(option.formType);
    this.componentType = "register";
  }

  switchAccountType() {
    this.componentType = "account-type";
    this.errorFlag = false;
    this.errorMessage = "";
  }

  changeRegisterForm(id: number) {
    this.selectedAccountType = this.getAccountTypeByFormType(id);
    if (id === 1) {
      this.isCorporate = true;
      this.isAgent = false;
    } else if (id === 2) {
      this.isCorporate = false;
      this.isAgent = true;
    } else {
      this.isCorporate = false;
      this.isAgent = false;
    }
    this.updateValidators()

    this.registerFormGroup.reset();
    this.errorMessage = "";
    this.errorFlag = false;
    this.formType = id;
  }

  goLandingPage() {
    if (this.componentType === "register") {
      this.switchAccountType();
      return;
    }
    this.router.navigate(["/user/home"]);
  }

  getAccountTypeByFormType(formType: number): AccountTypeOption {
    for (const option of this.accountTypeOptions) {
      if (option.formType === formType) {
        return option;
      }
    }
    return this.accountTypeOptions[0];
  }

  getBrandTitle(): string {
    if (this.componentType === "login") {
      return this.defaultBrandTitle;
    }
    if (this.componentType === "register") {
      return this.selectedAccountType.brandTitle;
    }
    return this.defaultBrandTitle;
  }

  getBrandDescription(): string {
    if (this.componentType === "login") {
      return this.defaultBrandDescription;
    }
    if (this.componentType === "register") {
      return this.selectedAccountType.brandDescription;
    }
    return this.defaultBrandDescription;
  }

  getBrandPreviewPath(): string {
    return this.componentType === "login"
      ? this.certificatePreviewPath
      : this.dashboardPreviewPath;
  }

  showProgress(): boolean {
    return (
      this.componentType === "account-type" ||
      this.componentType === "register" ||
      this.componentType === "otpVerification" ||
      this.componentType === "maxResendOTP"
    );
  }

  isProgressComplete(): boolean {
    return this.componentType !== "account-type";
  }

  updateValidators() {
    const isCorporate = this.isCorporate;
    const isAgent = this.isAgent;

    // Update validators for corporateInfo
    if (isCorporate) {
      this.registerFormGroup
        .get("corporateInfo")
        .setValidators([Validators.required]);
    } else {
      this.registerFormGroup.get("corporateInfo").clearValidators();
    }
    this.registerFormGroup.get("corporateInfo").updateValueAndValidity();

    // Update validators for cac
    if (isCorporate) {
      this.registerFormGroup
        .get("cac")
        .setValidators([
          Validators.required,
          Validators.pattern("[A-Za-z0-9]*"),
          Validators.minLength(8),
        ]);
    } else {
      this.registerFormGroup.get("cac").clearValidators();
    }
    this.registerFormGroup.get("cac").updateValueAndValidity();

    // Update validators for firstname, lastname
    if (isAgent) {
      this.registerFormGroup
        .get("firstname")
        .setValidators([Validators.required]);
      this.registerFormGroup
        .get("lastname")
        .setValidators([Validators.required]);
    } else {
      if (isCorporate) {
        this.registerFormGroup.get("firstname").clearValidators();
        this.registerFormGroup.get("lastname").clearValidators();
      } else {
        this.registerFormGroup
          .get("firstname")
          .setValidators([Validators.required]);
        this.registerFormGroup
          .get("lastname")
          .setValidators([Validators.required]);
      }
    }
    this.registerFormGroup.get("firstname").updateValueAndValidity();
    this.registerFormGroup.get("lastname").updateValueAndValidity();

    if (!isCorporate && !isAgent) {
      this.registerFormGroup.get("corporateInfo").clearValidators();
      this.registerFormGroup.get("cac").clearValidators();
    }
  }

  mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true })
      } else {
        matchingControl.setErrors(null);
      }

      return null;
    };
  }
}
