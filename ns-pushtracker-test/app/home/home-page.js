const frameModule = require("ui/frame");
const dialogsModule = require("ui/dialogs");
const HomeViewModel = require("./home-view-model");

let vm = null;

/* ***********************************************************
* Use the "onNavigatingTo" handler to initialize the page binding context.
*************************************************************/
function onNavigatingTo(args) {
    /* ***********************************************************
    * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
    * Skipping the re-initialization on back navigation means the user will see the
    * page in the same data state that he left it in before navigating.
    *************************************************************/
    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;
  
  vm = new HomeViewModel();
    page.bindingContext = vm;
    page.bindingContext.update();
}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
    const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

function listViewItemTap(args) {
  var index = args.index;
  dialogsModule.alert({
    title: "Daily Info",
    message: JSON.stringify(vm.HistoricalDataSource.getItem(index), null, 2),
    okButtonText: "Ok"
  });
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.listViewItemTap = listViewItemTap;
