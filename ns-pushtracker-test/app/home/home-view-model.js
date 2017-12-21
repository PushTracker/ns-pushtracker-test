const observableModule = require("data/observable");

const DataStorage = require("../shared/data-storage/data-storage");

function HomeViewModel() {
    const viewModel = observableModule.fromObject({
	pushesWithData: DataStorage.HistoricalData.getDataSource("pushesWith"),
	pushesWithoutData: DataStorage.HistoricalData.getDataSource("pushesWithout")
    });

    return viewModel;
}

module.exports = HomeViewModel;
