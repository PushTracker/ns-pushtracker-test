const observableModule = require("data/observable");

/* ***********************************************************
 * Keep data that is displayed in your app drawer in the MyDrawer custom component view model.
 *************************************************************/
function MyDrawerViewModel(selectedPage) {
    const viewModel = observableModule.fromObject({
        /* ***********************************************************
         * Use the MyDrawer view model to initialize the properties data values.
         *************************************************************/
        selectedPage: selectedPage,

	user: {
	    name: "finger563",
	    email: "william@max-mobility.com",
	    icon: ""
	}
    });

    return viewModel;
}

module.exports = MyDrawerViewModel;
