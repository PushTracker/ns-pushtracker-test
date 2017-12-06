const observableModule = require("data/observable");

function MapViewModel() {
    const viewModel = observableModule.fromObject({

        fabTap: function(args) {
            console.log("TAPPED");
        }

    });

    return viewModel;
}

module.exports = MapViewModel;
