import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";

@Component({
  selector: "app-userauth",
  templateUrl: "./userauth.component.html",
  styleUrls: ["./userauth.component.css"],
})
export class UserauthComponent {
  tables: any[] = [
    { id: 1, name: "Corporate/ Enterprise", selected: false },
    { id: 2, name: "Agent", selected: false },
    { id: 3, name: "Individual", selected: false },
  ];

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<UserauthComponent>
  ) {}

  showForm(table: any) {
    this.tables = this.tables.map((ele) => {
      ele.selected = ele.id === table.id;
      return ele;
    });

    this.router.navigate(["user/signup"], {
      queryParams: { componentType: "register", formType: table.id },
    });

    this.dialogRef.close("Close");
  }
}
