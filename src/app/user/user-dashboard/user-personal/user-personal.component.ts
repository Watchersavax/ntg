import { Component, OnInit } from '@angular/core';
import { UserDetails } from '../../user-models/UserDetails';
import { UserdataService } from '../../userservices/userdata.service';
import { UserdetailsService } from '../../userservices/userdetails.service';
import { State } from '../../user-models/State';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-personal',
  templateUrl: './user-personal.component.html',
  styleUrls: ['./user-personal.component.css']
})
export class UserPersonalComponent implements OnInit {
  userdetails = new UserDetails();
  statelist: State[] = [];
  detailsupdateform: FormGroup;
  hide = true;
  errorflag: boolean = false;
  errormessage: string = "";
  originalContact: string = "";

  constructor(private userdataservice: UserdataService, private userdetailsservice: UserdetailsService) {

    this.detailsupdateform = new FormGroup({
      firstName: new FormControl(),
      lastName: new FormControl(),
      cooperateName: new FormControl(),
      address: new FormControl(Validators.required),
      contact: new FormControl([Validators.required]),
      pincode: new FormControl(Validators.required),
      state: new FormControl(Validators.required),
      cityName: new FormControl(),
    });

  }

  ngOnInit() {
    let userid: number = JSON.parse(localStorage.getItem("userdata"))["userId"];
    this.userdetailsservice.fetchUserDetails(userid).subscribe(data => {
      if (data["success"] === true) {
        this.userdetails = data["data"];
        this.userdetails.isPhoneVerified = this.userdetails.isPhoneVerified === true;
        this.originalContact = this.userdetails.contact;
        // Fetch list of states from database 
        this.userdetailsservice.fetchStateList().subscribe((data1) => {
          if (data1["success"] === true) {
            this.statelist = data1["data"];
          }
        }, () => {
        	
        });
      }
    }, () => {
      
    });
  }

  phoneKeyPress(event: any) {
    const inputChar = String.fromCharCode(event.charCode);
    const value = event.target.value || '';

    if (/[0-9]/.test(inputChar)) {
      return;
    }

    if (inputChar === '+' && event.target.selectionStart === 0 && !value.includes('+')) {
      return;
    }

    event.preventDefault();
  }
  toggle() {
    this.errorflag = !this.errorflag;
  }

  onSubmit() {
    
    if (this.detailsupdateform.status === "INVALID")
      return;

    this.userdetails.firstName = this.detailsupdateform.controls["firstName"].value;
    this.userdetails.lastName = this.detailsupdateform.controls["lastName"].value;
    this.userdetails.corporateInfo = this.detailsupdateform.controls["cooperateName"].value;
    this.userdetails.pincode = this.detailsupdateform.controls["pincode"].value;
    this.userdetails.address = this.detailsupdateform.controls["address"].value;
    this.userdetails.contact = this.detailsupdateform.controls["contact"].value;
    this.statelist.forEach(state => {
      if (state.stateId === this.detailsupdateform.controls["state"].value) {
        this.userdetails.state = state;
      }
    });

    this.userdetailsservice.updateUserDetails(this.userdetails).subscribe((response: any) => {

      if (response.success) {
        this.userdetails = response.data;
        this.originalContact = this.userdetails.contact;
        this.updateUserDataStorage();
      }
    }, () => {
      this.showErrorMessage('Failed to save details. Please try again.');
    });
  }

  onPhoneVerified(userDetails: UserDetails) {
    if (!userDetails) {
      return;
    }
    this.userdetails = userDetails;
    this.userdetails.isPhoneVerified = this.userdetails.isPhoneVerified === true;
    this.originalContact = this.userdetails.contact;
    this.updateUserDataStorage();
  }

  showErrorMessage(message: string) {
    this.errormessage = message;
    this.errorflag = true;
  }

  private updateUserDataStorage() {
    const userData = JSON.parse(localStorage.getItem('userdata'));
    if (!userData) {
      return;
    }
    userData.firstName = this.userdetails.firstName;
    userData.lastName = this.userdetails.lastName;
    userData.contact = this.userdetails.contact;
    userData.address = this.userdetails.address;
    userData.isPhoneVerified = this.userdetails.isPhoneVerified;
    userData.state = this.userdetails.state;
    userData.pincode = this.userdetails.pincode;
    userData.displayName = this.userdetails.firstName + ' ' + this.userdetails.lastName;
    userData.profilePic = this.userdetails.profilePic;
    localStorage.setItem('userdata', JSON.stringify(userData));
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
