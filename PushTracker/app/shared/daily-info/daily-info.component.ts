import { Component, OnInit } from '@angular/core';
import { Packet } from "../packet/packet";

@Component({
    moduleId: module.id,
    selector: 'app-daily-info',
    templateUrl: './daily-info.component.html',
    styleUrls: ['./daily-info.component.scss']
})
export class DailyInfoComponent implements OnInit {

    // public members

    public year: number = 2017;
    public month: number = 1;
    public day: number = 1;
    public pushesWith: number = 0;
    public pushesWithout: number = 0;
    public coastWith: number = 0;
    public coastWithout: number = 0;
    public distance: number = 0;
    public speed: number = 0;
    public ptBattery: number = 0;
    public sdBattery: number = 0;

    // private members

    // functions

    constructor(bytes?: Array<any>) {
	if (bytes !== null && bytes !== undefined) {
	    this.fromUint8Array(bytes);
	}
    }

    constructor(obj?: any) {
	this.year = obj && obj.year || 2017;
	this.month = obj && obj.month || 1;
	this.day = obj && obj.day || 1;
	this.pushesWith = obj && obj.pushesWith || 0;
	this.pushesWithout = obj && obj.pushesWithout || 0;
	this.coastWith = obj && obj.coastWith || 0;
	this.coastWithout = obj && obj.coastWithout || 0;
	this.distance = obj && obj.distance || 0;
	this.speed = obj && obj.speed || 0;
	this.ptBattery = obj && obj.ptBattery || 0;
	this.sdBattery = obj && obj.sdBattery || 0;
    }

    add(di): void {
	this.pushesWith += di && di.pushesWith || 0;
	this.pushesWithout += di && di.pushesWithout || 0;
	this.coastWith += di && di.coastWith || 0;
	this.coastWithout += di && di.coastWithout || 0;
	this.distance += di && di.distance || 0;
    }

    getDate(): Date {
	return new Date(
	    year,
	    month - 1, // their month is zero indexed
	    day
	);
    }

    sameAsDate(date): bool {
	const d = this.getDate();
	return d.getFullYear() === date.getFullYear() &&
	    d.getMonth() === date.getMonth() &&
	    d.getDate() === date.getDate();
    }

    sameAsDailyInfo(di): bool {
	return this.year === di.year &&
	    this.month === di.month &&
	    this.day === di.day;
    }

    fromUint8Array(arr): void {
	const p = new Packet(arr);
	this.fromPacket(p);
	p.destroy();
    }

    fromPacket(p): void {
	const di = p.data("dailyInfo");
	this.year = di.year;
	this.month = di.month;
	this.day = di.day;
	this.pushesWith = di.pushesWith;
	this.pushesWithout = di.pushesWithout;
	this.coastWith = di.coastWith;
	this.coastWithout = di.coastWithout;
	this.distance = di.distance;
	this.speed = di.speed;
	this.ptBattery = di.ptBattery;
	this.sdBattery = di.sdBattery;
    }

    ngOnInit() { }

}
