/// <reference types="@types/datejs" />
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injectable, OnInit, ViewChild } from "@angular/core";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-pro-ui/sidedrawer";
import { SegmentedBar, SegmentedBarItem } from "ui/segmented-bar";
import { LinearAxis, DateTimeContinuousAxis, DateTimeCategoricalAxis, BarSeries } from "nativescript-pro-ui/chart";

import { ObservableArray } from "data/observable-array";
import { Observable } from "rxjs/Observable";

import { confirm } from "ui/dialogs";

import { RadSideDrawerComponent } from "nativescript-pro-ui/sidedrawer/angular";

import { HistoricalDataService } from "../shared/historical-data.service";
import { DailyInfoComponent } from "../shared/daily-info/daily-info.component";

require("../shared/date");

@Component({
    selector: "Dashboard",
    moduleId: module.id,
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [HistoricalDataService]
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

    // data source for chart
    public dataSource$: ObservableArray<DailyInfoComponent>;

    // private members
    private _sideDrawerTransition: DrawerTransitionBase;

    constructor(private historicalDataService: HistoricalDataService, private cd: ChangeDetectorRef) {
	this.dataSource$ = this.historicalDataService.getData();

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
	let majorStep = "Day";
	let labelFitMode = "None";
	let minBarSize = 1;
	let maxBarSize = 10;
	switch (this.selectedTime) {
	default:
	case "Week":
	    break;
	case "Month":
	    minimum = (30).days().ago();
	    majorStep = "Week";
	    labelFitMode = "None";
	    break;
	case "Year":
	    minimum = (11).months().ago();
	    maximum = (0).months().ago();
	    dateFormat = "MMM";
	    majorStep = "Month";
	    break;
	}
	const axesArray = [ this.pushesXAxis, this.coastXAxis, this.drivingXAxis ];
	axesArray.map((a) => {
	    if (a !== null && a !== undefined) {
		const xAxis = <DateTimeContinuousAxis>a.nativeElement;
		xAxis.minimum = minimum.toString("dd/MM/yyyy");
		xAxis.maximum = maximum.toString("dd/MM/yyyy");
		xAxis.majorStep = majorStep;
		xAxis.dateFormat= dateFormat;
		xAxis.labelFitMode = labelFitMode;
	    }
	});
    }

    public trackBallContentRequested(args): void {
    }

    public selectPoint(args): void {
	const eventName = args.eventName;
	const point = args.object;
	const series = args.series;
	const pointIndex = args.pointIndex;
	const pointData = args.pointData;
	console.log("point selected!");
	/*
	console.log(args.object);
	console.log(pointIndex);
	console.log(series.items);
	console.log(Object.keys(series.items));
	console.log(series.seriesName);
	*/
    }

    public unselectPoint(args): void {
	const eventName = args.eventName;
	const point = args.object;
	const series = args.series;
	const pointIndex = args.pointIndex;
	const pointData = args.pointData;
    }

    public onDashboardInitTap(): void {
	this.historicalDataService.update(new DailyInfoComponent({
	    month: 12,
	    day: 1,
	    pushesWith: 10,
	    pushesWithout: 14,
	    coastWith: 10.4,
	    coastWithout: 1.2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    month: 12,
	    day: 2,
	    pushesWith: 10,
	    pushesWithout: 14,
	    coastWith: 10.4,
	    coastWithout: 1.2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    month: 12,
	    day: 3,
	    pushesWith: 4,
	    pushesWithout: 20,
	    coastWith: 20,
	    coastWithout: 1,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    month: 12,
	    day: 25,
	    pushesWith: 10,
	    pushesWithout: 14,
	    coastWith: 10.4,
	    coastWithout: 1.2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    month: 12,
	    day: 26,
	    pushesWith: 4,
	    pushesWithout: 20,
	    coastWith: 20,
	    coastWithout: 1,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    month: 12,
	    day: 25,
	    pushesWith: 10,
	    pushesWithout: 14,
	    coastWith: 10.4,
	    coastWithout: 1.2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    month: 12,
	    day: 26,
	    pushesWith: 4,
	    pushesWithout: 20,
	    coastWith: 20,
	    coastWithout: 1,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    month: 12,
	    day: 27,
	    pushesWith: 4,
	    pushesWithout: 1,
	    coastWith: 8,
	    coastWithout: 2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    month: 12,
	    day: 29,
	    pushesWith: 4,
	    pushesWithout: 1,
	    coastWith: 8,
	    coastWithout: 2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    year: 2018,
	    month: 1,
	    day: 1,
	    pushesWith: 4,
	    pushesWithout: 1,
	    coastWith: 8,
	    coastWithout: 2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.historicalDataService.update(new DailyInfoComponent({
	    year: 2018,
	    month: 1,
	    day: 2,
	    pushesWith: 4,
	    pushesWithout: 1,
	    coastWith: 8,
	    coastWithout: 2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.dataSource$ = this.historicalDataService.getData();
	this.cd.detectChanges();
    }

    public onDashboardClearTap(): void {

        let options = {
            title: "Clear Historical Data",
            message: "Are you sure you want to delete all historical data?",
            okButtonText: "Yes",
            cancelButtonText: "No",
            neutralButtonText: "Cancel"
        };

        confirm(options).then((result: boolean) => {
	    if (result) {
		this.historicalDataService.clear();
		this.dataSource$ = this.historicalDataService.getData();
		this.cd.detectChanges();
	    }
        });
    }

    /* ***********************************************************
    * Use the sideDrawerTransition property to change the open/close animation of the drawer.
    *************************************************************/
    ngOnInit(): void {
        this._sideDrawerTransition = new SlideInOnTopTransition();
	this.dataSource$ = this.historicalDataService.getData();
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
