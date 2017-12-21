const LS = require("nativescript-localstorage");


const historicalDataKey = "PushTracker DaiyInfo History";
function HistoricalData() {
    this.data = [];
}

HistoricalData.prototype.save = function() {
    LS.setItem(historicalDataKey, this.data);
};

HistoricalData.prototype.load = function() {
    this.data = LS.getItem(historicalDataKey);
};

exports.HistoricalData = function() {
    return new HistoricalData();
};
