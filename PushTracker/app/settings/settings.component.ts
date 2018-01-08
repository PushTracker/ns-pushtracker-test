import { Component, OnInit, ViewChild } from "@angular/core";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-pro-ui/sidedrawer";
import { RadSideDrawerComponent } from "nativescript-pro-ui/sidedrawer/angular";

import { Observable } from "data/observable";
import { confirm } from "ui/dialogs";

import { SegmentedBar, SegmentedBarItem } from "ui/segmented-bar";

import { ControlMode, Units } from "../shared/settings";
import { SettingsService } from "../shared/settings.service";

@Component({
    selector: "Settings",
    moduleId: module.id,
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit {
    /* ***********************************************************
    * Use the @ViewChild decorator to get a reference to the drawer component.
    * It is used in the "onDrawerButtonTap" function below to manipulate the drawer.
    *************************************************************/
    @ViewChild("drawer") drawerComponent: RadSideDrawerComponent;

    public ControlModes: Array<SegmentedBarItem> = [];
    public Units: Array<SegmentedBarItem> = [];
    
    // private members
    private _sideDrawerTransition: DrawerTransitionBase;

    constructor() {
	ControlMode.Options.map((o) => {
	    const item = new SegmentedBarItem();
	    item.title = o;
	    this.ControlModes.push(item);
	});
	Units.Options.map((o) => {
	    const item = new SegmentedBarItem();
	    item.title = o;
	    this.Units.push(item);
	});
    }

    public onControlModeChange(args): void {
	let segmentedBar = <SegmentedBar>args.object;
	this.settings.set("controlMode", ControlMode.Options[segmentedBar.selectedIndex]);
    }

    public onUnitsChange(args): void {
	let segmentedBar = <SegmentedBar>args.object;
	this.settings.set("units", Units.Options[segmentedBar.selectedIndex]);
    }

    public onSliderUpdate(key, args) {
	this.settings.set(key, args.object.value);
    }

    /* ***********************************************************
    * Use the sideDrawerTransition property to change the open/close animation of the drawer.
    *************************************************************/
    ngOnInit(): void {
        this._sideDrawerTransition = new SlideInOnTopTransition();
    }

    get sideDrawerTransition(): DrawerTransitionBase {
        return this._sideDrawerTransition;
    }

    get settings(): Observable {
	return SettingsService.settings;
    }

    /* ***********************************************************
    * According to guidelines, if you have a drawer on your page, you should always
    * have a button that opens it. Use the showDrawer() function to open the app drawer section.
    *************************************************************/
    onDrawerButtonTap(): void {
        this.drawerComponent.sideDrawer.showDrawer();
    }

    onSaveSettingsTap(): void {
	confirm({
            title: "Save Settings?",
            message: "Send these settings to the PushTracker?",
            okButtonText: "Yes",
            cancelButtonText: "No"
	});
    }
}
