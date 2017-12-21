const LS = require("nativescript-localstorage");

const observableModule = require("data/observable");

const SettingsViewModel = require("../../settings/settings-view-model");
const DailyInfo = require("./daily-info");

// HISTORICAL DATA
const historicalDataKey = "PushTracker DaiyInfo History";
function HistoricalData() {
    this.viewSetting = "Week";

    this.data = [];
    this.load();
}

HistoricalData.prototype.save = function() {
    LS.setItem(historicalDataKey, this.data);
};

HistoricalData.prototype.load = function() {
    this.data = LS.getItem(historicalDataKey) || [];
};

HistoricalData.prototype.update = function(dailyInfo) {
    const sameDates = this.data.filter((di) => {
	return dailyInfo.sameDayAs(di);
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

HistoricalData.prototype.getDataSource = function(key) {
    const dataSource = this.data.map((d) => {
	return {
	    Date: DailyInfo.getDate(d).getTime(),
	    Value: d.data[key]
	};
    });
    dataSource.push({
	Date: new Date(2017, 10, 23).getTime(),
	Value: 10
    });
    return dataSource;
};

HistoricalData.prototype.getDataSourceAverage = function(key) {
    let sum = 0;
    let ds = this.getDataSource(key);
    let earliest = null;
    let latest = null;
    ds.map((el) => {
	if (earliest === null || el.Date < earliest) {
	    earliest = el.Date;
	}
	if (latest === null || el.Date > latest) {
	    latest = el.Date;
	}
	sum += el.Value;
    });
    let avg = sum / ds.length;
    const dataSource = [
	{ Date: earliest, Value: avg },
	{ Date: latest, Value: avg },
    ];
    return dataSource;
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

