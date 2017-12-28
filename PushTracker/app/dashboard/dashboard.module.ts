import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { SharedModule } from "../shared/shared.module";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./dashboard.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        DashboardRoutingModule,
        SharedModule
    ],
    declarations: [
        DashboardComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class DashboardModule { }
