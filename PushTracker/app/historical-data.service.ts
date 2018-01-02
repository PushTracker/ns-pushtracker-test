import { Injectable } from '@angular/core';

import { ObservableArray } from "data/observable-array";

import { Observable } from "rxjs/Rx";
import { Subject } from "rxjs/Subject";

import * as localStorage from "nativescript-localstorage";

import { DailyInfoComponent } from "./shared/daily-info/daily-info.component";

@Injectable()
export class HistoricalDataService {

    // public members
    public observableEvents;
    public dataSource: ObservableArray<DailyInfoComponent> = new ObservableArray();

    // private members
    private userChangedSource;
    private data: Array<DailyInfoComponent> = [];
    private static _instance: HistoricalDataComponent = new HistoricalDataComponent();
    private static fsKeyPrefix: string = "HistoricalDataComponent.";
    private static fsKeyData: string = "Data";

    constructor() {
	this.userChangedSource = new Subject<any>();
	this.observableEvents = this.userChangedSource.asObservable();

	this.update(new DailyInfoComponent({
	    month: 12,
	    day: 25,
	    pushesWith: 10,
	    pushesWithout: 14,
	    coastWith: 10.4,
	    coastWithout: 1.2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.update(new DailyInfoComponent({
	    month: 12,
	    day: 26,
	    pushesWith: 4,
	    pushesWithout: 20,
	    coastWith: 20,
	    coastWithout: 1,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.update(new DailyInfoComponent({
	    month: 12,
	    day: 27,
	    pushesWith: 4,
	    pushesWithout: 1,
	    coastWith: 8,
	    coastWithout: 2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.update(new DailyInfoComponent({
	    month: 12,
	    day: 29,
	    pushesWith: 4,
	    pushesWithout: 1,
	    coastWith: 8,
	    coastWithout: 2,
	    distance: 8.8,
	    speed: 4.3
	}));
	this.update(new DailyInfoComponent({
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
	this.update(new DailyInfoComponent({
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
    }

    public getDataSource(): ObservableArray<DailyInfoComponent> {
	return this.dataSource;
    }

    public saveData(): void {
	try {
	    const key = HistoricalDataService.fsKeyPrefix + HistoricalDataService.fsKeyData;
	    localStorage.setItem(key, this.data);
	}
	catch (ex) {
	    console.log(`couldn't save HistoricalData: ${ex}`);
	}
    }

    public loadData(): void {
	try {
	    const key = HistoricalDataService.fsKeyPrefix + HistoricalDataService.fsKeyData;
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

}
