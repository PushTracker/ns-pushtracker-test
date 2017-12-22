const Packet = require("../../packet/packet");

function DailyInfo(arr) {
    this.data = {
        year: 2017,
        month: 1,
        day: 1,
        pushesWith: 0,
        pushesWithout: 0,
        coastWith: 0,
        coastWithout: 0,
        distance: 0.0,
        speed: 0,
        ptBattery: 0,
        sdBattery: 0
    };
    if (arr !== null && arr !== undefined) {
        this.fromUint8Array(arr);
    }
}

function getDate(di) {
    const date = new Date(
	di.data.year,
	di.data.month-1, // they use month as zero indexed
	di.data.day
    );
    return date;
};

function sameAsDate(di, d) {
    var diDate = getDate(di);
    return diDate.getFullYear() === d.getFullYear() &&
	diDate.getMonth() === d.getMonth() &&
	diDate.getDate() === d.getDate();
};

DailyInfo.prototype.sameDateAs = function(d) {
    var myDate = getDate(this);
    return myDate.getFullYear() === d.getFullYear() &&
	myDate.getMonth() === d.getMonth() &&
	myDate.getDate() === d.getDate();
};

DailyInfo.prototype.sameDailyInfoAs = function(di) {
    return this.data.year === di.data.year &&
	this.data.month === di.data.month &&
	this.data.day === di.data.day;
};

DailyInfo.prototype.add = function(di) {
    this.data.pushesWith += di.data.pushesWith;
    this.data.pushesWithout += di.data.pushesWithout;
    this.data.coastWith += di.data.coastWith;
    this.data.coastWithout += di.data.coastWithout;
    this.data.distance += di.data.distance;
};

DailyInfo.prototype.fromUint8Array = function(arr) {
    const p = new Packet.Packet(arr);
    this.fromPacket(p);
    p.destroy();
};

DailyInfo.prototype.fromPacket = function(p) {
    const di = p.data("dailyInfo");
    this.data = {
        year: di.year,
        month: di.month,
        day: di.day,
        pushesWith: di.pushesWith,
        pushesWithout: di.pushesWithout,
        coastWith: di.coastWith,
        coastWithout: di.coastWithout,
        distance: di.distance,
        speed: di.speed,
        ptBattery: di.ptBattery,
        sdBattery: di.sdBattery
    };
};

module.exports.DailyInfo = function(bytes) {
    return new DailyInfo(bytes);
};

module.exports.getDate = getDate;
module.exports.sameAsDate = sameAsDate;
