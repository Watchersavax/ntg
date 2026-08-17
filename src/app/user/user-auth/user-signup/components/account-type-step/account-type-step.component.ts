import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AccountTypeOption } from "../../auth.models";

/** Presentational account-type chooser (first signup step). */
@Component({
  selector: "app-account-type-step",
  templateUrl: "./account-type-step.component.html",
  styleUrls: ["../../auth-shared.css"],
})
export class AccountTypeStepComponent {
  @Input() options: AccountTypeOption[] = [];

  @Output() select = new EventEmitter<AccountTypeOption>();
  @Output() login = new EventEmitter<void>();
}
