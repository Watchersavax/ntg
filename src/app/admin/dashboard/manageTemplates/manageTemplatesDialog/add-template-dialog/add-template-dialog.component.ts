import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { HttpClient } from "@angular/common/http";

import { environment } from "src/environments/environment";
import { LoadingscreenService } from "src/app/services/loadingscreen.service";
import { Category, SubCategory } from "src/app/shared/models/Category";
import { NewTemplateRequest } from "src/app/shared/models/NewTemplateRequest";
import { NewTemplateResponse } from "src/app/shared/models/NewTemplateResponse";
import { TableRows } from "src/app/shared/models/TableRows";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { SubCategoryList } from "src/app/shared/models/CategoryList";
import { UserVerification } from "src/app/user/user-models/UserVerification";
import { UserdetailsService } from "src/app/user/userservices/userdetails.service";

@Component({
  selector: "app-add-template-dialog",
  templateUrl: "./add-template-dialog.component.html",
  styleUrls: ["./add-template-dialog.component.css"]
})
export class AddTemplateDialogComponent implements OnInit {
  editformgroup: FormGroup;
  categories: Category[] = [];
  subcategories: SubCategory[] = [];
  categoriesname: string[] = [];
  subcategory: boolean = false;
  errorflag: boolean = false;
  errormessage = "";
  designactive: boolean = true;
  selectedIndex = 0;
  storeselectedIndex = 0;
  rowelement: TableRows = null;
  createnewflag = true;
  verificationTypes: UserVerification[] = [];
  verificationTypeIds: number[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogref: MatDialogRef<AddTemplateDialogComponent>,
    private http: HttpClient,
    private loadingservice: LoadingscreenService,
    public userdetailsService: UserdetailsService,private fb: FormBuilder
  ) {
    
    this.dialogref.disableClose = true;
    this.editformgroup = this.fb.group({
      name: new FormControl("", Validators.required),
      category: new FormControl("", Validators.required),
      price: new FormControl("", [
        Validators.required,
        Validators.min(0),
        Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")
      ]),
      version: new FormControl("", Validators.required),
      subcategory: new FormControl("", Validators.required),
      verificationTypesArray: this.fb.array([]),
      fastTrackPercentage: new FormControl("", [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")
      ])
    });

    //set categories array and categoriesname array
    this.categories = [...this.data["categoriesarray"]];
    this.subcategories = [];
    this.categoriesname = [...this.data["categoriesnamearray"]];
    this.categoriesname.push("none");
  }

  ngOnInit() {
    const selectedCategoryId = this.editformgroup.controls["category"].value;
    if (selectedCategoryId) {
      this.fetchSubcategories(selectedCategoryId);
    }
    this.fetchAllVerification();
  }

  fetchAllVerification() {
    this.userdetailsService.getAllVerificationTypes()
      .subscribe((response: any) => {
        if (response.success) {
          this.verificationTypes = response.data.map(type => {
            return { ...type, isActivated: true };
          });
          
          const verificationTypesArray = this.editformgroup.get('verificationTypesArray') as FormArray;
          verificationTypesArray.clear();
          this.verificationTypes.forEach(type => {
            const control = new FormControl({ value: false, disabled: false });
            verificationTypesArray.push(control);
          });
        }
      });
  }

  get verificationTypesArray(): FormArray {
    return this.editformgroup.get('verificationTypesArray') as FormArray;
  }

  updateVerificationTypesBasedOnCategory(categoryId: number) {
    const selectedCategory = this.categories.find(cat => cat.templateCategoryId === categoryId);
    const isLegalFirm = selectedCategory && selectedCategory.templateCategoryName === 'Legal Firm';
    this.userdetailsService.getAllVerificationType(isLegalFirm)
      .subscribe((response: any) => {
        if (response.success) {
          const fetchedVerificationTypes = response.data;
          this.verificationTypes = this.verificationTypes.map(type => {
            const isEnabled = fetchedVerificationTypes.some(v => v.verificationId === type.verificationId);
            return { ...type, isActivated: isEnabled };
          });
          this.verificationTypesArray.controls.forEach((control, index) => {
            if (this.verificationTypes[index].isActivated) {
              control.enable(); 
            } else {
              control.disable(); 
            } 
            control.setValue(false);
          });
        }
      });
  }

  onCategoryChange(event: any) {
    const selectedCategoryId = event.value;
    if (selectedCategoryId) {
      this.fetchSubcategories(selectedCategoryId);
      this.updateVerificationTypesBasedOnCategory(selectedCategoryId);
      this.editformgroup.controls["subcategory"].setValue(null);
    
    } else {
      this.subcategories = [];
      this.editformgroup.controls["subcategory"].setValue(null);
    }
  }

  fetchSubcategories(categoryId: number) {
    
    this.http.get(`${environment.url}admin/template/allActiveSubCategories/${categoryId}`).subscribe((data: SubCategoryList) => {
          this.subcategories = data.data;
          if (this.subcategories.length > 0) {
          } else {
            this.editformgroup.controls["subcategory"].setValue(null);
          }
        },
        (error) => {
          console.error('Add template dialog: failed to fetch subcategories', error);
          this.showErrorMessage("Failed to load subcategories");
        }
      );
  }

  onSubmit() {
    if (this.editformgroup.invalid) {
      this.showErrorMessage("* Please fill out all required fields correctly.");
      return;
    }

    this.loadingservice.startLoading();
    const newtemplatecreation = new NewTemplateRequest();
    let flag = false;

    const selectedCategoryId = this.editformgroup.controls["category"].value;
    if (selectedCategoryId === "" || selectedCategoryId === "none") {
        this.loadingservice.stopLoading();
        this.showErrorMessage("* Select a valid Category");
        flag = true;
    }

    const selectedSubCategoryId = this.editformgroup.controls["subcategory"].value;
    if (selectedCategoryId !== "none" && (selectedSubCategoryId === "" || selectedSubCategoryId === "none")) {
        this.loadingservice.stopLoading();
        this.showErrorMessage("* Select a valid Subcategory");
        flag = true;
    }

    const selectedVerificationTypeIds = this.verificationTypesArray.controls
    .map((control, index) => control.value ? this.verificationTypes[index].verificationId : null)
    .filter(id => id !== null);

    if (selectedVerificationTypeIds.length === 0) {
        this.loadingservice.stopLoading();
        this.showErrorMessage("* Please select at least one verification type.");
        flag = true;
    }

    const fasttrackPercentage = this.editformgroup.controls["fastTrackPercentage"].value;
    if (fasttrackPercentage === "" || fasttrackPercentage < 0 || fasttrackPercentage > 100) {
      this.loadingservice.stopLoading();
      this.showErrorMessage("* Please provide a valid Fast-Track Percentage (0-100%).");
      flag = true;
    }

    if (!flag) {
     
      newtemplatecreation.verificationTypeIds=selectedVerificationTypeIds;
      // Prepare the new template request with proper IDs
      newtemplatecreation.templateId = 0;
      newtemplatecreation.templateName = this.editformgroup.controls["name"].value;
      newtemplatecreation.templateCategoryId = selectedCategoryId; // Set category ID
      newtemplatecreation.templateSubCategoryId = selectedSubCategoryId; // Set subcategory ID
      newtemplatecreation.templateValue = "<p>New Template</p>";
      newtemplatecreation.templatePrice = this.editformgroup.controls["price"].value;
      newtemplatecreation.publishedVersionId = 0;
      newtemplatecreation.templatePublishedVersion = null;
      newtemplatecreation.isPublished = true;
      newtemplatecreation.newTemplateVersionName = this.editformgroup.controls["version"].value;
      newtemplatecreation.fastTrackPercentage = fasttrackPercentage;

      // Call the API to save new template and send response back to table
    
        this.saveOrUpdateTemplate(newtemplatecreation);
      
    }
    else {
      this.loadingservice.stopLoading();
    }
  }

  private saveOrUpdateTemplate(newtemplatecreation: NewTemplateRequest) {
    if (this.rowelement === null) {
      const userData = JSON.parse(localStorage.getItem("admindata"));
      newtemplatecreation.userId = userData.userId;
      this.http
        .put(environment.url + "admin/template/saveTemplate", newtemplatecreation)
        .subscribe(
          (data: NewTemplateResponse) => {
            if (data.success === true) {
              this.rowelement = { serialno: 20, ...data.data };
              this.loadingservice.stopLoading();
              this.nextStep();
            } else {
              this.loadingservice.stopLoading();
              this.showErrorMessage("*" + data["error"]["message"]);
            }
          },
          (error) => {
            console.error('Add template dialog: failed to save template', error);
            this.loadingservice.stopLoading();
            this.showErrorMessage("* Unknown error occurred");
          }
        );
    } else {
      this.createnewflag = false;
      this.updateTemplate(newtemplatecreation);
    }
  }

  private updateTemplate(newtemplatecreation: NewTemplateRequest) {
    const updatedtemplatename = this.editformgroup.controls["name"].value;
    const updatedtemplatecategory = this.editformgroup.controls["category"].value;
    const updatedtemplatesubcategory = this.editformgroup.controls["subcategory"].value;
    const updatedtemplateprice = this.editformgroup.controls["price"].value;

    newtemplatecreation.templateId = this.rowelement.templateId;
    newtemplatecreation.templateName = updatedtemplatename;
    newtemplatecreation.templatePrice = updatedtemplateprice;
    newtemplatecreation.templateCategoryId = updatedtemplatecategory;
    newtemplatecreation.templateSubCategoryId = updatedtemplatesubcategory;

    this.http
      .put(environment.url + "admin/template/updateTemplate", newtemplatecreation)
      .subscribe(
        (data: NewTemplateResponse) => {
          if (data.success === true) {
            this.showErrorMessage("");
            this.nextStep();
          } else {
            this.showErrorMessage("*" + data["error"]["message"]);
          }
        },
        (error) => {
          console.error('Add template dialog: failed to update template', error);
          this.showErrorMessage("* Cannot edit right now");
        }
      );
  }

  toggle() {
    this.subcategory = !this.subcategory;
  }

  public nextStep() {
    if (
      this.editformgroup.controls["category"].status === "INVALID" ||
      this.editformgroup.controls["subcategory"].status === "INVALID" ||
      this.editformgroup.controls["name"].status === "INVALID" ||
      this.editformgroup.controls["price"].status === "INVALID" ||
      this.editformgroup.controls["version"].status === "INVALID"
    ) {
      this.showErrorMessage("*"+"Please fill mandatory fields");
      return;
    }else if(this.editformgroup.controls["name"].value.trim().length === 0){
    
      this.editformgroup.controls['name'].setErrors({'incorrect': true});
      this.showErrorMessage("*"+"Name should not be empty space");
      return ;
    
    }else if(this.editformgroup.controls["version"].value.trim().length === 0){

      this.editformgroup.controls['version'].setErrors({'incorrect': true});
      this.showErrorMessage("*"+"Version name should not be empty space");
      return ;
    
    }  else {

      this.wait(2000);
      this.selectedIndex += 1;
      this.storeselectedIndex ++;
      if (this.selectedIndex > 0) {
        this.designactive = false;
      }
    }

  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
      this.selectedIndex = tabChangeEvent.index;
    
  }

  showErrorMessage(message) {
    this.errorflag = true;
    this.errormessage = message;
  }

  wait(ms){
    
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }

 close(){
   this.dialogref.close();
 }

 keyDownFunction(event) {
  if(event.keyCode == 13) {
    event.preventDefault();
    this.onSubmit();
  }
}

}
