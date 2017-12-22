const LS = require("nativescript-localstorage");

const observableModule = require("data/observable");
const observableArray = require("data/observable-array");

const SettingsViewModel = require("../../settings/settings-view-model");
const DailyInfo = require("./daily-info");

const Date = require("../date");

// HISTORICAL DATA
const historicalDataKey = "PushTracker DaiyInfo History";
function HistoricalData() {
    this.data = [];
    this.load();
    this.viewSetting = "Week";
    this.dataSource = new observableArray.ObservableArray();
    this.updateDataSource();
}

HistoricalData.prototype.save = function() {
    LS.setItem(historicalDataKey, this.data);
};

HistoricalData.prototype.load = function() {
    this.data = LS.getItem(historicalDataKey) || [];
};

HistoricalData.prototype.getDataSource = function () {
    return this.dataSource;
};

HistoricalData.prototype.update = function(dailyInfo) {
    const sameDates = this.data.filter((di) => {
	return dailyInfo.sameDailyInfoAs(di);
    });
    if (sameDates.length > 1) {
	console.log("error: multiple days found with same date!");
    }
    else if (sameDates.length == 1) {
	const index = this.data.indexOf(sameDates[0]);
	this.data[index] = dailyInfo;
    }
    else {
	this.data.push(dailyInfo);
    }
    this.save();
};

HistoricalData.prototype.updateViewSetting = function(newViewSetting) {
    if (newViewSetting !== undefined && newViewSetting !== null) {
	this.viewSetting = newViewSetting;
	this.updateDataSource();
    }
};

HistoricalData.prototype.getDailyInfoAtDate = function(date) {
    var matching = this.data.filter((d) => {
	return DailyInfo.sameAsDate(d, date); 
    });
    var di = ( matching && matching[0] ) || new DailyInfo.DailyInfo();
    var retObj = di.data;
    retObj.Date = date;
    return retObj;
};

HistoricalData.prototype.updateDataSource = function() {
    this.dataSource.splice(0, this.dataSource.length);
    let numData = 0;
    switch (this.viewSetting) {
    case "Week":
	numData = 7;
	for (let i=0; i<numData; i++) {
	    var date = (i).days().ago();
	    var di = this.getDailyInfoAtDate(date);
	    this.dataSource.push(di);
	}
	break;
    case "Month":
	numData = 31;
	for (let i=0; i<numData; i++) {
	    var date = (i).days().ago();
	    var di = this.getDailyInfoAtDate(date);
	    this.dataSource.push(di);
	}
	break;
    case "Year":
	numData = 12;
	for (let i=0; i<numData; i++) {
	    var date = (i).months().ago();
	    var di = this.getDailyInfoAtDate(date);
	    this.dataSource.push(di);
	}
	break;
    default:
	break;
    };
};

HistoricalData.prototype.getTimeDomain = function(ds) {
    let earliest = null;
    let latest = null;
    ds.map((el) => {
	if (earliest === null || el.Date < earliest) {
	    earliest = el.Date;
	}
	if (latest === null || el.Date > latest) {
	    latest = el.Date;
	}
    });
    return {
	begin: earliest,
	end: latest,
    };
};

HistoricalData.prototype.addDataInRange = function(key, start, stop) {
    
};
const historicalData = new HistoricalData();

// SETTINGS
const settingsKey = "PushTracker SmartDrive Settings";
function Settings() {
    this.settings = new SettingsViewModel();
    this.settings.addEventListener(observableModule.Observable.propertyChangeEvent, (propChangeData) => {
	this.save();
    });
    this.load();
}

Settings.prototype.save = function() {
    try {
	LS.setItem(settingsKey, this.settings.toObject());
    }
    catch (ex) {
	console.log(ex);
    }
};

Settings.prototype.load = function() {
    try {
	this.settings.fromObject(LS.getItem(settingsKey) || {
	    controlMode: "MX2+",
	    units: "English",
	    ezOn: false,
	    acceleration: 30,
	    maxSpeed: 70,
	    tapSensitivity: 100
	});
    }
    catch (ex) {
	console.log(ex);
    }
};
const settings = new Settings();

// Module exports
exports.HistoricalData = historicalData;
exports.Settings = settings;

