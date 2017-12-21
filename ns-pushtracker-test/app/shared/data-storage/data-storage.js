const LS = require("nativescript-localstorage");

const observableModule = require("data/observable");

const SettingsViewModel = require("../../settings/settings-view-model");

// HISTORICAL DATA
const historicalDataKey = "PushTracker DaiyInfo History";
function HistoricalData() {
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

