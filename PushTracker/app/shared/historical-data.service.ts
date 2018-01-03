import { Injectable } from '@angular/core';
import { Http, Headers, Response } from "@angular/http";
import { ObservableArray } from "data/observable-array";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";

import * as localStorage from "nativescript-localstorage";

import { DailyInfoComponent } from "./daily-info/daily-info.component";

@Injectable()
export class HistoricalDataService {
    // public members
    public static dataSource: ObservableArray<DailyInfoComponent> = new ObservableArray();

    // private members
    private static fsKeyPrefix: string = "HistoricalDataComponent.";
    private static fsKeyData: string = "Data";

    private data: Array<DailyInfoComponent> = [];

    // public methods

    constructor() {
	this.loadFromFS();
	this.updateDataSource();
    }

    // loading
    public loadFromWeb() {
    }

    public loadFromFS() {
	try {
	    const key = HistoricalDataService.fsKeyPrefix + HistoricalDataService.fsKeyData;
	    this.data = localStorage.getItem(key) || [];
	}
	catch (ex) {
	    console.log(`couldn't load HistoricalData: ${ex}`);
	}
    }

    // saving
    public saveToFS() {
	try {
	    const key = HistoricalDataService.fsKeyPrefix + HistoricalDataService.fsKeyData;
	    localStorage.setItem(key, this.data);
	}
	catch (ex) {
	    console.log(`couldn't save HistoricalData: ${ex}`);
	}
    }

    public saveToWeb() {
    }

    // modifying
    private add(dailyInfo: DailyInfoComponent): void {
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
    }
    
    public update(dailyInfo: DailyInfoComponent): void {
	this.add(dailyInfo);
	this.updateDataSource();
	this.saveToFS();
    }

    public updateFromArray(array: Array<DailyInfoComponent>): void {
	array.map((di) => {
	    this.add(di);
	});
	this.updateDataSource();
	this.saveToFS();
    }

    public clear(): void {
	const len = HistoricalDataService.dataSource.length
	for (let i=0; i<len; i++) {
	    HistoricalDataService.dataSource.shift();
	}
	this.data.splice(0, this.data.length);
	this.saveToFS();
    }

    // private methods
    private updateDataSource(): void {
	HistoricalDataService.dataSource.splice(0, HistoricalDataService.dataSource.length, ...this.data);
    }
    
    private handleErrors(error: Response) {
	console.log(JSON.stringify(error.json()));
	return Observable.throw(error);
    }

    private convertData(dailyInfo: DailyInfoComponent): void {
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

}
