import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { DataService } from "./userservices/data.service";
import { Category, CategorySubCategoryTemplate } from "../shared/models/Category";
import { NewTemplateListResponse } from "../shared/models/TemplateListResponse";
import { TableRows } from "../shared/models/TableRows";
import {
  Router,
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  NavigationError,
} from "@angular/router";
import { UserdataService } from "./userservices/userdata.service";
import { LoadingscreenService } from "../services/loadingscreen.service";
import { UserLoginFlagService } from "./userservices/user-login-flag.service";
import { MatDialog } from "@angular/material/dialog";
import { UserauthComponent } from "./user-auth/userauth-dialog/userauth.component";
import { NavigationDrawerService } from "../services/navigation-drawer.service";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.css"],
})
export class UserComponent implements OnInit, AfterViewChecked {
  categories: Category[] = [];
  categorysubtemp: CategorySubCategoryTemplate[] = [];
  previousevent;
  templateList: TableRows[] = [];
  isSignedIn = false;
  userData: any;
  userType: string;
  filtervalue;
  filteredOptions: string[] = [];
  templatelist: TableRows[] = [];
  templatenamelist: string[] = [];
  userTypeVal: String;
  isOpen = false;
  isOpenProfile: any = false;
  isOpenContact: boolean = false;
  isSelectedProfile: any = false;
  isSelectedContact: boolean = false;
  profiles: any[] = [
    {
      select: false,
      link: "/user/user-profiles/individual",
      name: "Individual",
    },
    {
      select: false,
      link: "/user/user-profiles/corporate",
      name: "Corporate",
    },
    {
      select: false,
      link: "/user/user-profiles/agents",
      name: "Agents",
    },
  ];

  helpCenters: any[] = [
    {
      select: false,
      link: "/user/help-centre/faq",
      name: "FAQ’s",
    },
    {
      select: false,
      link: "/user/help-centre/contact",
      name: "Contact Us",
    },
  ];
  constructor(
    private navigationdrawer: NavigationDrawerService,
    private dialog: MatDialog,
    private userLoginFlagService: UserLoginFlagService,
    private dataService: DataService,
    private router: Router,
    private userdataService: UserdataService,
    private loadingService: LoadingscreenService,
    private cdref: ChangeDetectorRef
  ) {
    this.userType =
      !!localStorage.getItem("isAdmin") &&
      localStorage.getItem("isAdmin") == "true"
        ? "admindata"
        : "userdata";
    if (!!localStorage.getItem(this.userType)) {
      this.userData = JSON.parse(localStorage.getItem(this.userType));
      this.isSignedIn = true;
      if (this.userData.roleId != 2) {
        this.goToDashboard();
      }
    }

    this.userLoginFlagService.loggedInFlag.subscribe((data) => {
      this.isSignedIn = data;
    });

    this.router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.loadingService.startLoading();
      }
      if (routerEvent instanceof NavigationEnd) {
        this.loadingService.stopLoading();
        this.isOpen = false;
      }
      if (routerEvent instanceof NavigationError) {
        this.loadingService.stopLoading();
      }
      if (routerEvent instanceof NavigationCancel) {
        this.loadingService.stopLoading();
      }
    });

    this.userdataService.templatelistdataflag.subscribe((data) => {
      this.templatelist = data;
      this.convertObjToNameList();
    });
  }
  ngAfterViewChecked(): void {
    const path = location.pathname;
    if (path.includes("user-profiles")) {
      this.isSelectedProfile = true;
      this.isSelectedContact = false;

      this.profiles = this.profiles.map((profile) => {
        profile.select = false;
        if (profile.link.includes(path)) {
          profile.select = true;
        }
        return profile;
      });

      this.helpCenters = this.helpCenters.map((helpCenter: any) => {
        helpCenter.select = false;
        return helpCenter;
      })

    } else if (path.includes("help-centre")) {
      this.isSelectedProfile = false;
      this.isSelectedContact = true;

      this.profiles = this.profiles.map((profile) => {
        profile.select = false;
        return profile;
      });

      this.helpCenters = this.helpCenters.map((helpCenter: any) => {
        helpCenter.select = false;
        if (helpCenter.link.includes(path)) {
          helpCenter.select = true;
        }
        return helpCenter;
      })

    } else {
      this.isSelectedProfile = false;
      this.isSelectedContact = false;

      this.profiles = this.profiles.map((profile) => {
        profile.select = false;
        return profile;
      });

      this.helpCenters = this.helpCenters.map((helpCenter: any) => {
        helpCenter.select = false;
        return helpCenter;
      })

    }
    this.cdref.detectChanges();
  }

  ngOnInit(): void {
    const userdata = localStorage.getItem('userdata');
    const admindata = localStorage.getItem('admindata');
  
    if ((userdata !== null && userdata !== '') || (admindata !== null && admindata !== '')) {
            this.isSignedIn = true;
            this.userLoginFlagService.setLoggedInFlag();
            this.fetchTemplateList();
    }else{
      this.isSignedIn = false;
    }
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("componentType") == "login") {
      this.openSigninBox();
    }
  }

  fetchTemplateList() {
    // Fetch Categories
    if (localStorage.getItem("userdata") != "") {
      const userData = JSON.parse(localStorage.getItem("userdata"));
      if (userData.isAgent) {
        this.userTypeVal = "agent";
      } else if (userData.isCorporate) {
        this.userTypeVal = "corporate";
      } else {
        this.userTypeVal = "individual";
      }

      this.loadingService.startLoading();
      this.dataService.fetchAllTemplateTrimmedList(this.userTypeVal).subscribe(
        (data: string) => {
          const dataobj: NewTemplateListResponse = {
            ...JSON.parse(JSON.stringify(data)),
          };
          if (dataobj.success === true) {
            for (let i = 0; i < dataobj.data.length; i++) {
              const tempelement: TableRows = {
                serialno: i + 1,
                ...dataobj.data[i],
              };
              if (
                tempelement.publishedTemplateVersion != null &&
                tempelement.publishedTemplateVersion != undefined
              ) {
                this.templateList.push(tempelement);
              }
            }
            this.userdataService.setGlobalTemplateList(this.templateList);
          } else {
          }
          this.loadingService.stopLoading();
        },
        () => {
          
        }
      );
    }
  }
  allCatTempListing() {
    this.router.navigate(["/user", "home", "templist"]);
  }

  onSubmit(template) {
    let selectedTemplateObject = new TableRows();
    for (const templateObj of this.templateList) {
      if (templateObj.templateName === template) {
        selectedTemplateObject = templateObj;
      }
    }
    this.router.navigate([
      "/user",
      "affidavitdesc",
      selectedTemplateObject.templateId,
    ]);
  }

  openSigninBox() {

    this.router.navigate(["user/signup"], {
      queryParams: { componentType: "login" },
    });
  }

  openSignupBox() {
    const dialogRef = this.dialog.open(UserauthComponent, {
      data: { componentType: "register" },
      width: "30rem",
    });
  }

  goToDashboard() {
    this.userType =
      !!localStorage.getItem("isAdmin") &&
      localStorage.getItem("isAdmin") == "true"
        ? "admindata"
        : "userdata";
    this.userData = JSON.parse(localStorage.getItem(this.userType));
    switch (this.userData.roleId) {
      case 1:
        this.router.navigate(["/admin", "dashboard", "templates"]);
        break;
      case 2:
        if (this.userData.isAgent) {
          this.router.navigate(["/user", "myaccount", "agent", "documents"]);
        } else {
          this.router.navigate(["/user", "myaccount", "documents"]);
        }
        break;
      case 3:
        this.router.navigate(["/court", "registrars"]);
        break;
      case 4:
        this.router.navigate(["/court", "dashboard"]);
        break;
      default:
        this.router.navigate(["/user", "home"]);
        break;
    }
  }

  isActiveRoute(url: string): boolean {
    return this.router.isActive(url, true);
  }

  isInAccountArea(): boolean {
    return this.router.url.includes('/myaccount');
  }

  toggleSidebar(event) {
    this.navigationdrawer.toggleDrawer();
    event.stopPropagation();
  }

  toggleMobileMenu(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = !this.isOpen;
  }

  logout() {
    localStorage.setItem("userdata", "");
    this.userLoginFlagService.setLoggedOffFlag();
    this.router.navigate(["/user/home"]);
  }

  convertObjToNameList() {
    this.templatenamelist = [];
    this.filteredOptions = [];
    for (let i = 0; i < this.templatelist.length; i++) {
      if (
        this.templatelist[i].publishedTemplateVersion != null &&
        this.templatelist[i].publishedTemplateVersion != undefined
      ) {
        this.templatenamelist.push(this.templatelist[i].templateName);
      }
    }
  }

  filterList() {
    if (this.templatelist.length === 0) {
      this.templatelist = this.userdataService.templatelist;
      this.convertObjToNameList();
    } else {
      const filterValue = this.filtervalue.toLowerCase();
      this.filteredOptions = [];

      this.filteredOptions = this.templatenamelist.filter((option) =>
        option.toLowerCase().includes(filterValue)
      );

    }
  }

  onSearchSubmit() {
    let selectedTemplateObject = new TableRows();

    for (let i = 0; i < this.templatelist.length; i++) {
      if (this.templatelist[i].templateName === this.filtervalue) {
        selectedTemplateObject = this.templatelist[i];
      }
    }
    this.router.navigate([
      "/user",
      "affidavitdesc",
      selectedTemplateObject.templateId,
    ]);
  }

  onhittingEnter(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.onSearchSubmit();
    }
  }

  remove() {
    this.filtervalue = "";
  }
}