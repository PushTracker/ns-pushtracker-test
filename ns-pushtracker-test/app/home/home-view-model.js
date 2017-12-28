const observableModule = require("data/observable");

const DataStorage = require("../shared/data-storage/data-storage");

function HomeViewModel() {
    const viewModel = observableModule.fromObject({
	HistoricalDataSource: DataStorage.HistoricalData.getDataSource(),

	getDateFormat: DataStorage.HistoricalData.getDateFormat(),

	update: DataStorage.HistoricalData.updateDataSources.bind(DataStorage.HistoricalData),
	
        onDataRangeChanged: function(propertyChangeData) {
            var index = propertyChangeData.newIndex;
	    var newViewSetting = null;
	    switch (index) {
	    case 0:
		newViewSetting = "Year";
		break;
	    case 1:
		newViewSetting = "Month";
		break;
	    case 2:
		newViewSetting = "Week";
		break;
	    };
	    DataStorage.HistoricalData.updateViewSetting(newViewSetting);
        },
    });

    return viewModel;
}

module.exports = HomeViewModel;
