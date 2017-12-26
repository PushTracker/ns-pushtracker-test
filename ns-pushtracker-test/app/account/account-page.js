const frameModule = require("ui/frame");

const CurrentUser = require("./account-view-model");

const dialogsModule = require("ui/dialogs");

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
    page.bindingContext = CurrentUser.user;
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

function onSaveAccountTap() {
    dialogsModule.confirm({
        title: "Update User Account?",
        message: "Send these settings to the Server?",
        okButtonText: "Yes",
        cancelButtonText: "No"
    });
}

function onResetAccountTap() {
    dialogsModule.confirm({
        title: "Reset Account?",
        message: "Are you sure you want to reset your account (remove all your data / settings)?",
        okButtonText: "Yes",
        cancelButtonText: "No"
    });
}

function onChangePasswordTap() {
    dialogsModule.confirm({
        title: "Change Password?",
        message: "Are you sure you want to change your password?",
        okButtonText: "Yes",
        cancelButtonText: "No"
    });
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.onSaveAccountTap = onSaveAccountTap;
exports.onResetAccountTap = onResetAccountTap;
exports.onChangePasswordTap = onChangePasswordTap;
