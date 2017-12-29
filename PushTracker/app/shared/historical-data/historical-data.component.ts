import { Component, OnInit } from '@angular/core';

import * as localStorage from "nativescript-localstorage";

import { DailyInfoComponent } from "../daily-info/daily-info.component";

//import { Date } from "../date";

@Component({
    moduleId: module.id,
    selector: 'app-historical-data',
    templateUrl: './historical-data.component.html',
    styleUrls: ['./historical-data.component.scss']
})
export class HistoricalDataComponent implements OnInit {

    // public members
    public dataSource: Array<DailyInfoComponent> = []

    // private members
    private data: Array<DailyInfoComponent> = [];
    private static _instance: HistoricalDataComponent = new HistoricalDataComponent();
    private static fsKeyPrefix: string = "HistoricalDataComponent.";
    private static fsKeyData: string = "Data";

    // functions

    private constructor() {
	if (HistoricalDataComponent._instance) {
	    return HistoricalDataComponent._instance;
	}
	HistoricalDataComponent._instance = this;
	this.update(new DailyInfoComponent({
	    month: 11,
	    day: 25,
	    pushesWith: 10,
	    pushesWithout: 14,
	    coastWith: 10.4,
	    coastWithout: 1.2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.update(new DailyInfoComponent({
	    month: 11,
	    day: 26,
	    pushesWith: 4,
	    pushesWithout: 20,
	    coastWith: 20,
	    coastWithout: 1,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.update(new DailyInfoComponent({
	    month: 11,
	    day: 27,
	    pushesWith: 4,
	    pushesWithout: 1,
	    coastWith: 8,
	    coastWithout: 2,
	    distance: 8.8,
	    speed: 4.3
	}));
    }

    public static getInstance(): HistoricalDataComponent {
	return this._instance || (this._instance = new this());
    }

    public saveData(): void {
	try {
	    const key = HistoricalDataComponent.fsKeyPrefix + HistoricalDataComponent.fsKeyData;
	    localStorage.setItem(key, this.data);
	}
	catch (ex) {
	    console.log(`couldn't save HistoricalData: ${ex}`);
	}
    }

    public loadData(): void {
	try {
	    const key = HistoricalDataComponent.fsKeyPrefix + HistoricalDataComponent.fsKeyData;
	    this.data = localStorage.getItem(key) || [];
	}
	catch (ex) {
	    console.log(`couldn't load HistoricalData: ${ex}`);
	}
    }

    public convertData(dailyInfo: DailyInfoComponent): void {
	const convert = {
	    "coastWith": 100.0,
	    "coastWithout": 100.0,
	    "distance": 10.0,
	    "speed": 10.0
	};
	Object.keys(convert).map((k) => {
	    if (dailyInfo[k]) {
		dailyInfo[k] = dailyInfo[k] / convert[k];
	    }
	});
    }

    public update(dailyInfo: DailyInfoComponent): void {
	const sameDates = this.data.filter((di) => {
	    return dailyInfo.sameAsDailyInfo(di);
	});
	if (sameDates.length > 1) {
	    console.log(`error: multiple days with the same date: ${dailyInfo.getDate()}`);
	    return;
	}
	else if (sameDates.length === 1) {
	    const index = this.data.indexOf(sameDates[0]);
	    this.data[index] = dailyInfo;
	}
	else {
	    this.data.push(dailyInfo);
	}
	this.saveData();
	this.updateDataSource();
    }

    public updateDataSource(): void {
	this.dataSource.splice(0, this.dataSource.length, ...this.data);
    }

    ngOnInit() { }

}
