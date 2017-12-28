import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import { SegmentedBar, SegmentedBarItem } from "ui/segmented-bar";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-pro-ui/sidedrawer";
import { RadSideDrawerComponent } from "nativescript-pro-ui/sidedrawer/angular";

@Component({
    selector: "Dashboard",
    moduleId: module.id,
    templateUrl: "./dashboard.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
    /* ***********************************************************
    * Use the @ViewChild decorator to get a reference to the drawer component.
    * It is used in the "onDrawerButtonTap" function below to manipulate the drawer.
    *************************************************************/
    @ViewChild("drawer") drawerComponent: RadSideDrawerComponent;

    private _sideDrawerTransition: DrawerTransitionBase;

    public times: Array<string> = ["Year", "Month", "Week"];
    public timeSelections: Array<SegmentedBarItem>;
    public selectedTime: string = this.times[2];

    constructor() {
	this.timeSelections = [];
	this.times.map((t) => {
	    const item = new SegmentedBarItem();
	    item.title = t;
	    this.timeSelections.push(item);
	});
    }

    public onSelectedIndexChange(args) {
	let segmentedBar = <SegmentedBar>args.object;
	this.selectedTime = this.times[segmentedBar.selectedIndex];
	console.log(this.selectedTime);
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

    /* ***********************************************************
    * According to guidelines, if you have a drawer on your page, you should always
    * have a button that opens it. Use the showDrawer() function to open the app drawer section.
    *************************************************************/
    onDrawerButtonTap(): void {
        this.drawerComponent.sideDrawer.showDrawer();
    }
}
