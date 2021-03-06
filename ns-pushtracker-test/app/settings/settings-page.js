const dialogsModule = require("ui/dialogs");
const frameModule = require("ui/frame");
const segmentedBarModule = require("ui/segmented-bar");
const buttonModule = require("ui/button");
const gridModule = require("ui/layouts/grid-layout");

const SettingsViewModel = require("./settings-view-model");
const bluetooth = require("../bluetooth/bluetooth");
const Packet = require("../packet/packet");
const Binding = require("../packet/packet_bindings");

const DataStorage = require("../shared/data-storage/data-storage");

const fs = require("file-system");

const Toast = require("nativescript-toast");

const settings = DataStorage.Settings.settings;
let page = null;

function makePeripheralDebug() {
    try {
        bluetooth.isPeripheralModeSupported().then((supported) => {
            if (supported) {
                const startAdvBtn = new buttonModule.Button();
                startAdvBtn.text = "Start Advertisement";
                startAdvBtn.on(buttonModule.Button.tapEvent, onStartAdvertisementTap, this);
                startAdvBtn.cssClasses = ["button", "button-positive"];
                const stopAdvBtn = new buttonModule.Button();
                stopAdvBtn.text = "Stop Advertisement";
                stopAdvBtn.on(buttonModule.Button.tapEvent, onStopAdvertisementTap, this);
                stopAdvBtn.cssClasses = ["button", "button-positive"];

                const gridView = page.getViewById("bluetoothDebugGrid");
                gridView.addChild(startAdvBtn);
                gridModule.GridLayout.setRow(startAdvBtn, 1);
                gridModule.GridLayout.setColumn(startAdvBtn, 0);
                gridView.addChild(stopAdvBtn);
                gridModule.GridLayout.setRow(stopAdvBtn, 1);
                gridModule.GridLayout.setColumn(stopAdvBtn, 1);
            }
        });
    }
    catch (ex) {
        console.log(ex);
    }
}

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

    makePeripheralDebug();

    // add peripherals to settings
    settings.set("peripherals", bluetooth.peripherals);

    // set up control mode
    const controlModeView = page.getViewById("control_modes");
    const controlModeItems = settings.controlModes.map(makeItem);
    controlModeView.items = controlModeItems;
    controlModeView.selectedIndex = settings.controlModeSelection;
    //controlModeView.width = settings.controlModes.length * 75;

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

function sendSettings(device) {
    try {
        const cm = settings.getControlMode().name;
        const u = settings.getUnits().name;

        const p = new Packet.Packet();
        const settingsData = p.data("settings");

        let controlMode = "Off";
        let units = "English";
        let tapSens = 1.0;
        let accel = 0.3;
        let speed = 0.7;

        if (cm === "MX1") {
            controlMode = "Beginner";
        }
        else if (cm === "MX2") {
            controlMode = "Intermediate";
        }
        else if (cm === "MX2+") {
            controlMode = "Advanced";
        }
        if (u === "Metric") {
            units = "Metric";
        }
        tapSens = settings.tapSensitivity / 100.0;
        accel = settings.acceleration / 100.0;
        speed = settings.maxSpeed / 100.0;

        settingsData.ControlMode = Binding.SmartDriveControlMode[controlMode];
        settingsData.Units = Binding.Units[units];
        settingsData.Flags = settings.ezOn ? 1 : 0;
        settingsData.Padding = 0;
        settingsData.TapSensitivity = tapSens;
        settingsData.Acceleration = accel;
        settingsData.MaxSpeed = speed;
        p.Type("Command");
        p.SubType("SetSettings");
        p.data("settings", settingsData);

        const data = Array.create("byte", 18);
        const pdata = p.toUint8Array();
        for (let i = 0; i < 18; i++) {
            data[i] = pdata[i];
        }
        console.log(`Sending Settings =>  ${Packet.toString(pdata)}`);
	bluetooth.sendToPushTracker(data);
        // free up memory
        p.destroy();
    }
    catch (ex) {
        console.log("error sending settings");
        console.log(ex);
    }
}

function onSaveSettingsTap(args) {
    let selectedPushTrackers = null;
    if (bluetooth.hasPushTrackerConnected()) {
        bluetooth.selectPushTrackers()
        .then((selection) => {
            if (selection) {
                selectedPushTrackers = selection;

                return dialogsModule.confirm({
                    title: "Save Settings?",
                    message: "Send these settings to the PushTracker?",
                    okButtonText: "Yes",
                    cancelButtonText: "No"
                });
            }

            return null;
        }).then((result) => {
            if (result) {
                sendSettings();
                bluetooth.notifyPushTrackers(selectedPushTrackers);
                Toast.makeText("Sent settings").show();
            }
        });
    }
    else {
        dialogsModule.alert({
            title: "Error",
            message: "No PushTracker is connected!",
            okButtonText: "OK"
        });
    }
}

function onOTATap() {
    dialogsModule.confirm({
	title: "Check for Firmware Updates?",
	message: "Would you like to see if there are newer firmwares for the PushTracker, SmartDrive Microcontroller, and SmartDrive Bluetooth?",
	okButtonText: "Yes",
	cancelButtonText: "No"
    })
	.then((result) => {
	    if (result) {
		return performSmartDriveOTA()
		    .then(performSmartDriveBluetoothOTA)
		    .then(performPushTrackerOTA);
	    }
	})
	.catch((err) => {
	    console.log(err);
	});
}

function performSmartDriveOTA() {
    return new Promise((resolve, reject) => {
	var fname = __dirname + "/../shared/data/MX2+.14.ota";
	var otaFile = fs.File.fromPath(fname);
	var ota = otaFile.readSync();
	console.log(`got MX2+ OTA, version: 0x${Number(ota[0]).toString(16)}`);
	resolve();
    });
}

function performSmartDriveBluetoothOTA() {
    return new Promise((resolve, reject) => {
	var fname = __dirname + "/../shared/data/SmartDriveBluetooth.14.ota";
	var otaFile = fs.File.fromPath(fname);
	var ota = otaFile.readSync();
	console.log("got SDBT OTA");
	resolve();
    });
}

function performPushTrackerOTA() {
    return new Promise((resolve, reject) => {
	var fname = __dirname + "/../shared/data/PushTracker.14.ota";
	var otaFile = fs.File.fromPath(fname);
	var ota = otaFile.readSync();
	console.log("got PT OTA");
	resolve();
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

function selectDialog(options) {
    // options should be of form....
    return new Promise((resolve, reject) => {
        dialogsModule.action({
            message: options.message || "Select",
            cancelButtonText: options.cancelButtonText || "Cancel",
            actions: options.actions || []
        })
        .then((result) => {
            resolve(result !== "Cancel" ? result : null);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

function onStartAdvertisementTap() {
    try {
        bluetooth.isPeripheralModeSupported().then((supported) => {
            if (!supported) {
                dialogsModule.alert({
                    title: "Not Supported!",
                    message: "Peripheral mode is not supported on this device!",
                    okButtonText: "OK"
                });

                return;
            }
            else {
		const hasServices = bluetooth.hasServices();
		if (!hasServices) {
		    bluetooth.initialize();
		}
		else {
                    bluetooth.startAdvertising({
			UUID: "9358ac8f-6343-4a31-b4e0-4b13a2b45d86",
			settings: {
                            connectable: true
			},
			data: {
			    includeDeviceName: true
			}
                    })
			.then(() => {
			    console.log("Advertise started!");
			})
			.catch((err) => {
			    console.log("Couldn't start advertising: " + err);
			    Toast.makeText("Couldn't start advertising: " + err).show();
			});
		}
            }
        })
        .catch((err) => {
            console.log(err);
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
            bluetooth.disconnectPushTrackers(bluetooth.getConnectedPushTrackers());
            Toast.makeText("Advertising stopped").show();
        })
        .catch((err) => {
            console.log("Couldn't stop advertising: " + err);
            Toast.makeText("Couldn't stop advertising: " + err).show();
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

exports.onOTATap = onOTATap;

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
