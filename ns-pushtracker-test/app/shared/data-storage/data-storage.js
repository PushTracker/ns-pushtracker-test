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
    this.dateFormat = observableModule.fromObject({ format: "MMM", labelFitMode: "" });
    this.updateDataSources();
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
    this.updateDataSources();
};

HistoricalData.prototype.getDateFormat = function() {
    return this.dateFormat;
};

HistoricalData.prototype.swapDataSource = function() {
    this.updateAxesFormat();
    this.dataSource.splice(0, this.dataSource.length);
    this.dataSources[this.viewSetting].map((ds) => {
	this.dataSource.push(ds);
    });
};

HistoricalData.prototype.updateAxesFormat = function() {
    switch (this.viewSetting) {
    case "Week":
	this.dateFormat.set("plotMode", "BetweenTicks");
	this.dateFormat.set("dateTimeComponent", "Day");
	this.dateFormat.set("majorStep", "Day");
	this.dateFormat.set("format", "MMM d");
	this.dateFormat.set("labelFitMode", "");
	this.dateFormat.set("minimum", (6).days().ago());
	this.dateFormat.set("maximum", (0).days().ago());
	break;
    case "Month":
	this.dateFormat.set("plotMode", "BetweenTicks");
	this.dateFormat.set("dateTimeComponent", "Day");
	this.dateFormat.set("majorStep", "Day");
	this.dateFormat.set("format", "MMM d");
	this.dateFormat.set("labelFitMode", "Rotate");
	this.dateFormat.set("minimum", (30).days().ago());
	this.dateFormat.set("maximum", (0).days().ago());
	break;
    case "Year":
	this.dateFormat.set("plotMode", "BetweenTicks");
	this.dateFormat.set("dateTimeComponent", "Month");
	this.dateFormat.set("majorStep", "Month");
	this.dateFormat.set("format","MMM");
	this.dateFormat.set("labelFitMode", "");
	this.dateFormat.set("minimum", (11).months().ago());
	this.dateFormat.set("maximum", (0).months().ago());
	break;
    default:
	break;
    };
};

HistoricalData.prototype.updateViewSetting = function(newViewSetting) {
    if (newViewSetting !== undefined && newViewSetting !== null) {
	this.viewSetting = newViewSetting;
	this.swapDataSource();
    }
};

HistoricalData.prototype.convertData = function(obj) {
    const convert = {
	"coastWith": 100.0,
	"coastWithout": 100.0,
	"distance": 10.0,
	"speed": 10.0
    };
    Object.keys(convert).map((k) => {
	if (obj[k]) {
	    obj[k] = obj[k] / convert[k];
	}
    });
};

HistoricalData.prototype.removeZeroData = function(obj) {
    Object.keys(obj).map((k) => {
	if (obj[k] === 0 || obj[k] === 0.0) {
	    obj[k] = null;
	}
    });
};

HistoricalData.prototype.getDailyInfoForMonth = function(date) {
    var matching = this.data.filter((di) => {
	var d = DailyInfo.getDate(di);
	return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });
    var dailyInfo = new DailyInfo.DailyInfo();
    matching.map((di) => {
	dailyInfo.add(di);
    });
    var retObj = Object.assign({}, dailyInfo.data);
    retObj.Date = date;
    this.removeZeroData(retObj);
    this.convertData(retObj);
    return retObj;
};

HistoricalData.prototype.getDailyInfoAtDate = function(date) {
    var matching = this.data.filter((d) => {
	return DailyInfo.sameAsDate(d, date); 
    });
    var di = ( matching && matching[0] ) || new DailyInfo.DailyInfo();
    var retObj = Object.assign({}, di.data);
    retObj.Date = date;
    this.removeZeroData(retObj);
    this.convertData(retObj);
    return retObj;
};

HistoricalData.prototype.updateDataSources = function() {
    this.dataSources = {
	"Year": [],
	"Month": [],
	"Week": []
    };
    ["Week", "Month", "Year"].map((vs) => {
	let numData = 0;
	switch (vs) {
	case "Week":
	    numData = 7;
	    for (let i = (numData - 1); i >= 0; i--) {
		var date = (i).days().ago();
		var di = this.getDailyInfoAtDate(date);
		this.dataSources[vs].push(di);
	    }
	    break;
	case "Month":
	    numData = 31;
	    for (let i = (numData - 1); i >= 0; i--) {
		var date = (i).days().ago();
		var di = this.getDailyInfoAtDate(date);
		this.dataSources[vs].push(di);
	    }
	    break;
	case "Year":
	    numData = 12;
	    for (let i = (numData - 1); i >= 0; i--) {
		var date = (i).months().ago();
		var di = this.getDailyInfoForMonth(date);
		this.dataSources[vs].push(di);
	    }
	    break;
	default:
	    break;
	};
    });
    this.swapDataSource();
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

// USER Information
const userKey = "UserAccount";
function AccountViewModel() {
    const viewModel = observableModule.fromObject({
	name: "William Emfinger",
	account: "finger563",
	email: "william@max-mobility.com",
	password: "",
	token: "",

	toObject: function() {
	    var obj = {
		name: this.name,
		account: this.account,
		email: this.email,
		token: this.token
	    };
	    return obj;
	},

	fromObject: function(obj) {
	    this.name = obj.name;
	    this.account = obj.account;
	    this.email = obj.email;
	    this.token = obj.token;
	}
    });

    return viewModel;
}
function CurrentUser() {
    this.user = new AccountViewModel();
    this.user.addEventListener(observableModule.Observable.propertyChangeEvent, (propChangeData) => {
	this.save();
    });
    this.load();
}

CurrentUser.prototype.save = function() {
    try {
	LS.setItem(userKey, this.user.toObject());
    }
    catch (ex) {
	console.log(ex);
    }
};

CurrentUser.prototype.load = function() {
    try {
	this.user.fromObject(LS.getItem(userKey) || {
	    name: "William Emfinger",
	    account: "finger563",
	    email: "william@max-mobility.com",
	    password: "",
	    token: ""
	});
    }
    catch (ex) {
	console.log(ex);
    }
};
const currentUser = new CurrentUser();


// Module exports
exports.HistoricalData = historicalData;
exports.CurrentUser = currentUser;
exports.Settings = settings;

