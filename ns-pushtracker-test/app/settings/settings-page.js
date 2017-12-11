const dialogsModule = require("ui/dialogs");
const frameModule = require("ui/frame");
const segmentedBarModule = require("ui/segmented-bar");

const SettingsViewModel = require("./settings-view-model");
const bluetooth = require("../bluetooth/bluetooth");

const settings = new SettingsViewModel();
let page = null;

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

    page = args.object;
    page.bindingContext = settings;

    function makeItem(o) {
        const i = new segmentedBarModule.SegmentedBarItem();
        i.title = o.name;

        return i;
    }

    // add peripherals to settings
    settings.set("peripherals", bluetooth.peripherals);

    // set up control mode
    const controlModeView = page.getViewById("control_modes");
    const controlModeItems = settings.controlModes.map(makeItem);
    controlModeView.items = controlModeItems;
    controlModeView.selectedIndex = settings.controlModeSelection;

    // set up units
    const unitsView = page.getViewById("units");
    const unitsItems = settings.units.map(makeItem);
    unitsView.items = unitsItems;
    unitsView.selectedIndex = settings.unitsSelection;
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

function onSaveSettingsTap(args) {
    dialogsModule.confirm({
        title: "Save Settings?",
        message: "Send these settings to the PushTracker?",
        okButtonText: "Yes",
        cancelButtonText: "No"
    });
}

// bluetooth interaction
function onBluetoothEnabledTap() {
    console.log("tapped!");
    bluetooth.isBluetoothEnabled().then((enabled) => {
        dialogsModule.alert({
            title: "Enabled?",
            message: enabled ? "Yes" : "No",
            okButtonText: "OK, Thanks"
        });
    })
    .catch((err) => {
        console.log(err);
    });
}

function onEnableBluetoothTap() {
    bluetooth.enable().then((enabled) => {
        dialogsModule.alert({
            title: "Did the user allow enabling Bluetooth by our app?",
            message: enabled ? "Yes" : "No",
            okButtonText: "OK, nice!"
        });
    });
}

function onPeripheralTap(args) {
    const index = args.index;
    const peri = bluetooth.peripherals.getItem(index);
    console.log(`selected: ${peri.UUID}`);

    const navigationEntry = {
        moduleName: "bluetooth/services-page",
        context: {
            info: "something you want to pass to your page",
            foo: "bar",
            peripheral: peri,
            settings: settings
        },
        animated: true
    };
    const topmost = frameModule.topmost();
    topmost.navigate(navigationEntry);
}

function updatePeripheralListHeight(h) {
    if (page === null) {
        return;
    }
    // update height of the list view accordingly
    const peripheralList = page.getViewById("peripherals");
    if (peripheralList !== null) {
        peripheralList.height = h;
    }
}

function peripheralDiscoveredCallback(p) {
}

function doScanForSmartDrive() {
    settings.set("isLoading", true);
    bluetooth.scanForSmartDrive(peripheralDiscoveredCallback)
    .then(() => {
        settings.set("isLoading", false);
    })
    .catch((err) => {
        settings.set("isLoading", false);
        dialogsModule.alert({
            title: "Whoops",
            message: `${err}`,
            okButtonText: "OK, got it."
        });
    });
}

function doStartScanning() {
    settings.set("isLoading", true);
    bluetooth.scanForAny(peripheralDiscoveredCallback)
    .then(() => {
        settings.set("isLoading", false);
    })
    .catch((err) => {
        settings.set("isLoading", false);
        dialogsModule.alert({
            title: "Whoops",
            message: `${err}`,
            okButtonText: "OK, got it."
        });
    });
}

function doStopScanning() {
    bluetooth.stopScanning()
    .then(() => {
        settings.set("isLoading", false);
    })
    .catch((err) => {
        settings.set("isLoading", false);
        dialogsModule.alert({
            title: "Whoops",
            message: `${err}`,
            okButtonText: "OK, that's fine"
        });
    });
}

function doClearPeripherals() {
    bluetooth.clearPeripherals();
}

function onPeripheralsChangedEvent(args) {
    const newHeight = 40 * (bluetooth.peripherals.length);
    updatePeripheralListHeight(newHeight);
}

bluetooth.peripherals.on("change", onPeripheralsChangedEvent);

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.onSaveSettingsTap = onSaveSettingsTap;

exports.doStopScanning = doStopScanning;
exports.doStartScanning = doStartScanning;
exports.doScanForSmartDrive = doScanForSmartDrive;
exports.onPeripheralTap = onPeripheralTap;
exports.onEnableBluetoothTap = onEnableBluetoothTap;
exports.onBluetoothEnabledTap = onBluetoothEnabledTap;
exports.doClearPeripherals = doClearPeripherals;
