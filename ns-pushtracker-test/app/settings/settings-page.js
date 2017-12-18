const dialogsModule = require("ui/dialogs");
const frameModule = require("ui/frame");
const segmentedBarModule = require("ui/segmented-bar");

const SettingsViewModel = require("./settings-view-model");
const bluetooth = require("../bluetooth/bluetooth");
const Toast = require("nativescript-toast");

const settings = new SettingsViewModel();
let page = null;

/* ***********************************************************
* Use the "onNavigatingTo" handler to initialize the page binding context.
*************************************************************/
function onNavigatingTo(args) {
    bluetooth._bluetooth.setCharacteristicLogging(false);
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
    controlModeView.width = settings.controlModes.length * 75;

    // set up units
    const unitsView = page.getViewById("units");
    const unitsItems = settings.units.map(makeItem);
    unitsView.items = unitsItems;
    unitsView.selectedIndex = settings.unitsSelection;
    unitsView.width = settings.units.length * 100;
}

function onNavigatingFrom() {
}

function onUnloaded() {
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
function onPeripheralModeSupportedTap() {
    try {
        bluetooth.isPeripheralModeSupported().then((supported) => {
            dialogsModule.alert({
                title: "Peripheral Mode Supported?",
                message: supported ? "Yes" : "No",
                okButtonText: "OK, Thanks"
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }
    catch (ex) {
        console.log(ex);
    }
}

function onStartAdvertisementTap() {
    try {
        bluetooth.startAdvertising({
            UUID: "9358ac8f-6343-4a31-b4e0-4b13a2b45d86",
            settings: {
                connectable: true
            },
            data: {}
        })
        .then(() => {
            console.log("Advertise started!");
            Toast.makeText("Advertising started").show();
        })
        .catch((err) => {
            console.log("Couldn't start advertising: "+err);
            Toast.makeText("Couldn't start advertising: "+err).show();
        });
    }
    catch (ex) {
        console.log(ex);
    }
}

function onStopAdvertisementTap() {
    try {
        bluetooth.stopAdvertising()
        .then(() => {
            console.log("Advertise stopped!");
            Toast.makeText("Advertising stopped").show();
        })
        .catch((err) => {
            console.log("Couldn't stop advertising: "+err);
            Toast.makeText("Couldn't stop advertising: "+err).show();
        });
    }
    catch (ex) {
        console.log(ex);
    }
}

function onBluetoothEnabledTap() {
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

// for peripheral mode:

// see https://code.tutsplus.com/tutorials/how-to-advertise-android-as-a-bluetooth-le-peripheral--cms-25426
// see https://docs.nativescript.org/core-concepts/accessing-native-apis-with-javascript for how to get intellisense on native apis

function doSetDiscoverable() {
    bluetooth.setDiscoverable();
}

// end for peripheral mode

function doDisable() {
    bluetooth.disable();
}

bluetooth.peripherals.on("change", onPeripheralsChangedEvent);

exports.onNavigatingTo = onNavigatingTo;
exports.onNavigatingFrom = onNavigatingFrom;
exports.onUnloaded = onUnloaded;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.onSaveSettingsTap = onSaveSettingsTap;

exports.doSetDiscoverable = doSetDiscoverable;
exports.doDisable = doDisable;

exports.doStopScanning = doStopScanning;
exports.doStartScanning = doStartScanning;
exports.doScanForSmartDrive = doScanForSmartDrive;
exports.onPeripheralTap = onPeripheralTap;
exports.onEnableBluetoothTap = onEnableBluetoothTap;
exports.onPeripheralModeSupportedTap = onPeripheralModeSupportedTap;
exports.onBluetoothEnabledTap = onBluetoothEnabledTap;
exports.onStartAdvertisementTap = onStartAdvertisementTap;
exports.onStopAdvertisementTap = onStopAdvertisementTap;
exports.doClearPeripherals = doClearPeripherals;
