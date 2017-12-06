const observableModule = require("data/observable");

function MapViewModel() {
    const viewModel = observableModule.fromObject({

    });

    return viewModel;
}

module.exports = MapViewModel;
module.exports.fabTap = function(args) {
    console.log(args);
    console.log("tapped");
};
