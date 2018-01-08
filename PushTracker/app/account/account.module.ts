import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { SharedModule } from "../shared/shared.module";
import { AccountRoutingModule } from "./account-routing.module";
import { AccountComponent } from "./account.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        AccountRoutingModule,
	NativeScriptFormsModule,
        SharedModule
    ],
    declarations: [
        AccountComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AccountModule { }
