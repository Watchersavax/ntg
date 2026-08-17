import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from "@angular/forms";
import { HttpClient } from '@angular/common/http';
import { LoadingscreenService } from 'src/app/services/loadingscreen.service';
import { environment } from 'src/environments/environment';
import { TableRows } from 'src/app/shared/models/TableRows';
import { Category, SubCategory } from 'src/app/shared/models/Category';
import { SubCategoryList } from 'src/app/shared/models/CategoryList';
import { NewTemplateRequest } from 'src/app/shared/models/NewTemplateRequest';
import { NewTemplateResponse } from 'src/app/shared/models/NewTemplateResponse';
import { UserdetailsService } from "src/app/user/userservices/userdetails.service";
import { UserVerification } from "src/app/user/user-models/UserVerification";

@Component({
  selector: "app-edit-template-dialog",
  templateUrl: "./edit-template-dialog.component.html",
  styleUrls: ["./edit-template-dialog.component.css"]
})
export class EditTemplateDialogComponent implements OnInit {
  tablerow:TableRows;
  editformgroup: FormGroup;
  categories: Category[] = [];
  subcategories: SubCategory[] = [];
  errorflag = false;
  errormessage = "";
  regex = new RegExp(/^\d*\.?\d{0,2}$/g);
  verificationTypes: UserVerification[] = [];
  selectedVerificationIds: number[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EditTemplateDialogComponent>,
  private http:HttpClient,private loadingscreen:LoadingscreenService,public userdetailsService: UserdetailsService,private fb: FormBuilder) {
    dialogRef.disableClose = true;
    
    this.tablerow = data;
    this.editformgroup = this.fb.group({

      templateName: new FormControl(this.tablerow.templateName,Validators.required),
      templateCategory: new FormControl(this.tablerow.templateCategory.templateCategoryId,Validators.required),
      templateSubCategory: new FormControl(
        this.tablerow.templateSubCategory ? this.tablerow.templateSubCategory.templateSubCategoryId : null,
        Validators.required
      ),
      templatePrice: new FormControl(this.tablerow.templatePrice,Validators.required),
      verificationTypesArray: this.fb.array([]),
      fastTrackPercentage: new FormControl(this.tablerow.fastTrackPercentage, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")
      ])
    });
  }

  ngOnInit() {

    //fetch category list 
    //set categories array and categoriesname array
    this.categories = [...this.data["categoriesarray"]];
    const initialCategoryId = this.editformgroup.controls["templateCategory"].value;
    if (initialCategoryId) {
      this.fetchSubcategories(initialCategoryId);
      this.fetchVerificationTypes(this.tablerow.templateId, initialCategoryId);
    }
    this.editformgroup.controls["templateCategory"].valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.fetchSubcategories(categoryId);
        this.fetchVerificationTypes(this.tablerow.templateId, categoryId);
      }
    });
  }

  fetchVerificationTypes(templateId: number, categoryId: number) {
    this.setVerificationTypesControls([], []);

    this.userdetailsService.getAllVerificationTypeByTemplateId(templateId)
      .subscribe((response: any) => {
        
        if (response.success) {
          this.selectedVerificationIds = response.data.map(v => v.verificationId);
          
          this.fetchAllVerification(categoryId);
        } else {
          this.showErrorMessage("Failed to load verification types");
        }
      }, error => {
        this.showErrorMessage("Failed to load verification types");
      });
  }
  
  fetchAllVerification(categoryId: number) {
    const selectedCategory = this.categories.find(cat => cat.templateCategoryId === categoryId);
    const isLegalFirm = selectedCategory && selectedCategory.templateCategoryName === 'Legal Firm';
  
    this.userdetailsService.getAllVerificationType(isLegalFirm)
      .subscribe((response: any) => {
        
        if (response.success) {
          this.verificationTypes = response.data;
          this.setVerificationTypesControls(this.verificationTypes, this.selectedVerificationIds);
        } else {
          this.showErrorMessage("Failed to load verification types");
        }
      }, error => {
        this.showErrorMessage("Failed to load verification types");
      });
  }
  
  setVerificationTypesControls(verificationTypes: UserVerification[], selectedVerificationIds: number[]) {
    const formArray = this.editformgroup.get('verificationTypesArray') as FormArray;
    formArray.clear(); 
    
    verificationTypes.forEach(type => {
      const isSelected = selectedVerificationIds.includes(type.verificationId);
      
      const control = new FormControl(isSelected);
      formArray.push(control);
    });
  }

  get verificationTypesArray(): FormArray {
    return this.editformgroup.get('verificationTypesArray') as FormArray;
  }

  onCategoryChange(event) {
    const selectedCategoryId = event.value;
    this.fetchSubcategories(selectedCategoryId);
  }

  fetchSubcategories(categoryId: number) {
    this.http.get(`${environment.url}admin/template/allActiveSubCategories/${categoryId}`).subscribe(
      (data: SubCategoryList) => {
        this.subcategories = data.data;
        const existingSubCategoryId = this.tablerow.templateSubCategory
        ? this.tablerow.templateSubCategory.templateSubCategoryId
        : null;
        if (this.subcategories.length > 0) {
          const selectedSubCategory = this.subcategories.find(
            subcat => subcat.templateSubCategoryId === existingSubCategoryId
          );
  
          this.editformgroup.controls["templateSubCategory"].setValue(selectedSubCategory ? selectedSubCategory.templateSubCategoryId : null);
        } else {
          this.editformgroup.controls["templateSubCategory"].setValue(null);
        }
      },
      (error) => {
        this.showErrorMessage("Failed to load subcategories");
      }
    );
  }

  getSelectedVerificationIds(): number[] {
    const formArray = this.editformgroup.get('verificationTypesArray') as FormArray;
    return formArray.controls
      .map((control, index) => control.value ? this.verificationTypes[index].verificationId : null)
      .filter(id => id !== null) as number[];
  }

  onSubmit() {
    if(this.editformgroup.controls["templateName"].status === 'INVALID' || this.editformgroup.controls["templateName"].value.trim().length === 0){
      this.showErrorMessage("Please fill Template Name");
      this.loadingscreen.stopLoading();
      return ;
    }
     if(this.editformgroup.controls['templatePrice'].status === 'INVALID' ){
      
      this.showErrorMessage("Please fill Template Price Properly");
      this.loadingscreen.stopLoading();
      return ;
    }

    if (this.editformgroup.controls["fastTrackPercentage"].status === 'INVALID') {
      this.showErrorMessage("* Please provide a valid Fast-Track Percentage (0-100%).");
      this.loadingscreen.stopLoading();
      return ;
   
    }

    if (!this.tablerow.isSystemGenerated && !this.editformgroup.controls["templateSubCategory"].value && !this.tablerow.isCaseRelated) {
      this.showErrorMessage("Please select a Template Subcategory");
      this.loadingscreen.stopLoading();
      return;
    }

    const selectedVerificationIds = this.getSelectedVerificationIds();
    if (!this.tablerow.isSystemGenerated && selectedVerificationIds.length === 0 && !this.tablerow.isCaseRelated) {
      this.showErrorMessage("Please select at least one verification type");
      this.loadingscreen.stopLoading();
      return;
    }

    let newtemplatecreation = new NewTemplateRequest();
    newtemplatecreation.templateId =this.tablerow.templateId;
    newtemplatecreation.templateName = this.editformgroup.controls["templateName"].value.trim();
    newtemplatecreation.templatePrice = this.editformgroup.controls["templatePrice"].value;
    newtemplatecreation.fastTrackPercentage= this.editformgroup.controls["fastTrackPercentage"].value;
    newtemplatecreation.templateCategoryId= this.editformgroup.controls["templateCategory"].value;
    newtemplatecreation.templateSubCategoryId= this.editformgroup.controls["templateSubCategory"].value;
    newtemplatecreation.verificationTypeIds = selectedVerificationIds;
    //     //id should be selected from category array 

    //call backend api to save new version in the database 
    this.http.put(environment.url+"admin/template/updateTemplate",newtemplatecreation).subscribe((data:NewTemplateResponse)=>{
    
      if(data.success === true){
      this.dialogRef.close(data["data"]);
      }
      else{
        this.showErrorMessage(data["error"]["message"]);
        
      }

    },() =>{
      this.showErrorMessage("cant edit right now");
      
    });
  
  }

  showErrorMessage(message){
    this.errorflag=true;
    this.errormessage = "*"+message;
  }

  keyDownFunction(event) {
    if(event.keyCode == 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }
  
}
