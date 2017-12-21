const observableModule = require("data/observable");

const DataStorage = require("../shared/data-storage/data-storage");

function HomeViewModel() {
    const viewModel = observableModule.fromObject({
	pushesWithData: DataStorage.HistoricalData.getDataSource("pushesWith"),
	worldWideAverage: DataStorage.HistoricalData.getDataSourceAverage("pushesWithout"),
	pushesWithoutData: DataStorage.HistoricalData.getDataSource("pushesWithout")
    });

    return viewModel;
}

module.exports = HomeViewModel;
