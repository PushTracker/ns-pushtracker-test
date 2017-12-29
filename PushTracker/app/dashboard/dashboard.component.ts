import { ChangeDetectionStrategy, Component, ElementRef, Injectable, OnInit, ViewChild } from "@angular/core";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-pro-ui/sidedrawer";
import { SegmentedBar, SegmentedBarItem } from "ui/segmented-bar";
import { LinearAxis } from "nativescript-pro-ui/chart";

import { RadSideDrawerComponent } from "nativescript-pro-ui/sidedrawer/angular";

import { HistoricalDataComponent } from "../shared/historical-data/historical-data.component";

//require("../shared/date");

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
    
    @ViewChild("pushesXAxis") pushesXAxis: ElementRef;
    @ViewChild("coastXAxis") coastXAxis: ElementRef;
    @ViewChild("drivingXAxis") drivingXAxis: ElementRef;

    // public members
    public times: Array<string> = ["Year", "Month", "Week"];
    public timeSelections: Array<SegmentedBarItem>;
    public selectedTime: string = this.times[2];

    public HistoricalData: HistoricalDataComponent = HistoricalDataComponent.getInstance();

    // private members
    private _sideDrawerTransition: DrawerTransitionBase;

    constructor() {
        this.timeSelections = [];
        this.times.map((t) => {
            const item = new SegmentedBarItem();
            item.title = t;
            this.timeSelections.push(item);
        });
    }

    public onSelectedIndexChange(args): void {
        const segmentedBar = <SegmentedBar>args.object;
        this.selectedTime = this.times[segmentedBar.selectedIndex];

	let minimum = (7).days().ago();
	let maximum = (0).days().ago();
	let dateFormat = "MMM d";
	let majorStep = "Week";
	let labelFitMode = "None";
	let majorTickInterval = 1;
	switch (this.selectedTime) {
	default:
	case "Week":
	    break;
	case "Month":
	    majorTickInterval = 7;
	    minimum = (31).days().ago();
	    majorStep = "Month";
	    labelFitMode = "Rotate";
	    break;
	case "Year":
	    minimum = (11).months().ago();
	    maximum = (0).months().ago();
	    dateFormat = "MMM";
	    majorStep = "Year";
	    break;
	}
	let xAxis = null;
	if (this.pushesXAxis !== undefined) {
	    xAxis = <LinearAxis>this.pushesXAxis.nativeElement;
	    xAxis.minimum = minimum.toString("dd/MM/yyyy");
	    xAxis.maximum = minimum.toString("dd/MM/yyyy");
	    //xAxis.majorStep = majorStep;
	    xAxis.dateFormat= dateFormat;
	    xAxis.labelFitMode = labelFitMode;
	    xAxis.majorTickInterval = majorTickInterval;
	}
	if (this.coastXAxis !== undefined) {
	    xAxis = <LinearAxis>this.coastXAxis.nativeElement;
	    xAxis.minimum = minimum.toString("dd/MM/yyyy");
	    xAxis.maximum = minimum.toString("dd/MM/yyyy");
	    //xAxis.majorStep = majorStep;
	    xAxis.dateFormat= dateFormat;
	    xAxis.labelFitMode = labelFitMode;
	    xAxis.majorTickInterval = majorTickInterval;
	}
	if (this.drivingXAxis !== undefined) {
	    xAxis = <LinearAxis>this.drivingXAxis.nativeElement;
	    xAxis.minimum = minimum.toString("dd/MM/yyyy");
	    xAxis.maximum = minimum.toString("dd/MM/yyyy");
	    //xAxis.majorStep = majorStep;
	    xAxis.dateFormat= dateFormat;
	    xAxis.labelFitMode = labelFitMode;
	    xAxis.majorTickInterval = majorTickInterval;
	}
    }

    public selectPoint(args): void {
	const eventName = args.eventName;
	const point = args.object;
	const series = args.series;
	const pointIndex = args.pointIndex;
	const pointData = args.pointData;

	console.log(args.object);
	console.log(pointIndex);
	console.log(series.items[pointIndex]);
	console.log(series.seriesName);
    }

    public unselectPoint(args): void {
	const eventName = args.eventName;
	const point = args.object;
	const series = args.series;
	const pointIndex = args.pointIndex;
	const pointData = args.pointData;
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
