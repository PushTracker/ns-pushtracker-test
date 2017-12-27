const dialogsModule = require("ui/dialogs");
const observableModule = require("data/observable");
const observableArray = require("data/observable-array");

const bluetooth = require("nativescript-bluetooth");
const Toast = require("nativescript-toast");

const SnackBarModule = require("nativescript-snackbar");

const DataStorage = require("../shared/data-storage/data-storage");
const DailyInfo = require("../shared/data-storage/daily-info");
const Packet = require("../packet/packet");
const Binding = require("../packet/packet_bindings");

const smartDriveServiceUUID = "0cd51666-e7cb-469b-8e4d-2742f1ba7723";
const pushTrackerServiceUUID = "1d14d6ee-fd63-4fa1-bfa4-8f47b42119f0";

const peripherals = new observableArray.ObservableArray();

let pushTrackerDataCharacteristic = null;
let appService = null;

let snackbar = new SnackBarModule.SnackBar();

function notify(text) {
    snackbar.simple(text);
}

function scan(uuids, onDiscoveredCallback) {
    peripherals.splice(0, peripherals.length);

    return bluetooth.startScanning({
        serviceUUIDs: uuids,
        seconds: 4,
        onDiscovered: function(peripheral) {
            if (onDiscoveredCallback && typeof onDiscoveredCallback === "function") {
                onDiscoveredCallback(peripheral);
            }
            peripherals.push(observableModule.fromObject(peripheral));
        }
    });
}

// returns a promise that resolves when scanning completes
function scanForAny(onDiscoveredCallback) {
    return scan([], onDiscoveredCallback);
}

// returns a promise that resolves when scanning completes
function scanForSmartDrive(onDiscoveredCallback) {
    return scan([smartDriveServiceUUID], onDiscoveredCallback);
}

function stopScanning() {
    return bluetooth.stopScanning();
}

function clearPeripherals() {
    peripherals.splice(0, peripherals.length);
}

function onDeviceBondChange(device, bondStatus) {
    switch (bondStatus) {
    case android.bluetooth.BluetoothDevice.BOND_BONDING:
        break;
    case android.bluetooth.BluetoothDevice.BOND_BONDED:
        bluetooth.removeBond(device);
	notify(`Paired with ${device.getName()}::${device}`);
        //Toast.makeText(`Paired with ${device.getName()}::${device}`).show();
        break;
    case android.bluetooth.BluetoothDevice.BOND_NONE:
        break;
    default:
        break;
    }
}

function onDeviceNameChange(device, name) {
    console.log(`${device} got new name: ${name}`);
}

function onDeviceUUIDChange(device, uuid) {
    console.log(`${device} got new uuid: ${uuid}`);
}

function onCharacteristicWrite(device, requestId, characteristic, preparedWrite, responseNeeded, offset, value) {
    const data = new Uint8Array(value);
    const p = new Packet.Packet(data);
    if (p.Type() === "Data" && p.SubType() === "DailyInfo") {
	notify(`${device.getName()}::${device} sent DailyInfo`);
        const di = DailyInfo.DailyInfo();
        di.fromPacket(p);
        console.log(JSON.stringify(di.data));
	DataStorage.HistoricalData.update(di);
    }
    else {
        console.log(`${p.Type()}::${p.SubType()} ${p.toString()}`);
    }
}

function onDeviceConnectionStateChanged(device, status, newState) {
    switch (newState) {
    case android.bluetooth.BluetoothProfile.STATE_CONNECTED:
	notify(`${device.getName()}::${device} connected`);
        //Toast.makeText(`${device.getName()}::${device} connected`).show();
        break;
    case android.bluetooth.BluetoothProfile.STATE_CONNECTING:
        break;
    case android.bluetooth.BluetoothProfile.STATE_DISCONNECTED:
	notify(`${device.getName()}::${device} disconnected`);
        //Toast.makeText(`${device.getName()}::${device} disconnected`).show();
        break;
    case android.bluetooth.BluetoothProfile.STATE_DISCONNECTING:
        break;
    default:
        break;
    }
}

function onDeviceACLDisconnected(device) {
    console.log(`${device} acl disconnected!`);
}

function initialize() {
    try {
	bluetooth.stopGattServer();
        bluetooth.setGattServerCallbacks({
	    onBondStatusChange: onDeviceBondChange,
	    onDeviceNameChange: onDeviceNameChange,
	    onDeviceUUIDChange: onDeviceUUIDChange,
	    onDeviceACLDisconnected: onDeviceACLDisconnected,
	    onCharacteristicWrite: onCharacteristicWrite,
	    onServerConnectionStateChange: onDeviceConnectionStateChanged
        });

	bluetooth.isBluetoothEnabled()
	    .then((enabled) => {
		if (!enabled) {
		    return bluetooth.enable();
		}
		else {
		    return new Promise((resolve, reject) => { resolve(enabled); });
		}
	    }).then((enabled) => {
		return bluetooth.isPeripheralModeSupported();
	    }).then((supported) => {
		return restart().then(() => { return supported; });
	    }).then((supported) => {
		if (supported) {
                    bluetooth.startGattServer();
		    
		    if (!hasServices()) {
			addServices();
		    }
		    else {
		    }

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
			    // now add it to the server
			    bluetooth.addService(appService);

			    console.log("Advertise started!");
			})
			.catch((err) => {
			    console.log("Couldn't start advertising: " + err);
			    Toast.makeText("Couldn't start advertising: " + err).show();
			});
		}
            });
    }
    catch (ex) {
        console.log(ex);
    }
}

function deleteServices() {
    try {
        bluetooth.clearServices();
    }
    catch (ex) {
        console.log(ex);
    }
}

function hasServices() {
    return bluetooth.offersService("9358ac8f-6343-4a31-b4e0-4b13a2b45d86");
}

function addServices() {
    try {
	console.log("deleting any existing services");
	deleteServices();
	console.log("making service");

	appService = bluetooth.makeService({
	    UUID: "9358ac8f-6343-4a31-b4e0-4b13a2b45d86",
	    serviceType: android.bluetooth.BluetoothGattService.SERVICE_TYPE_PRIMARY
	});

	const descriptorUUIDs = [
	    "2900",
	    "2902"
	];
	const charUUIDs = [
	    "58daaa15-f2b2-4cd9-b827-5807b267dae1",
	    "68208ebf-f655-4a2d-98f4-20d7d860c471",
	    "9272e309-cd33-4d83-a959-b54cc7a54d1f",
	    "8489625f-6c73-4fc0-8bcc-735bb173a920",
	    "5177fda8-1003-4254-aeb9-7f9edb3cc9cf"
	];
	const ptDataChar = charUUIDs[1];
	charUUIDs.map((cuuid) => {
	    console.log("Making characteristic: "+cuuid);
	    const c = bluetooth.makeCharacteristic({
		UUID: cuuid,
		gattProperty: android.bluetooth.BluetoothGattCharacteristic.PROPERTY_READ | 
		    android.bluetooth.BluetoothGattCharacteristic.PROPERTY_WRITE | 
		    android.bluetooth.BluetoothGattCharacteristic.PROPERTY_NOTIFY,
		gattPermissions: android.bluetooth.BluetoothGattCharacteristic.PERMISSION_WRITE | 
		    android.bluetooth.BluetoothGattCharacteristic.PERMISSION_READ
	    });
	    console.log("making descriptors");
	    const descriptors = descriptorUUIDs.map((duuid) => {
		const d = bluetooth.makeDescriptor({
		    UUID: duuid,
		    permissions: android.bluetooth.BluetoothGattDescriptor.PERMISSION_READ | 
			android.bluetooth.BluetoothGattDescriptor.PERMISSION_WRITE
		});
		d.setValue(new Array([0x00, 0x00]));
		console.log("Making descriptor: "+duuid);
		return d;
	    });
	    descriptors.map((d) => {
		c.addDescriptor(d);
	    });
	    c.setValue(0, android.bluetooth.BluetoothGattCharacteristic.FORMAT_UINT8, 0);
	    c.setWriteType(android.bluetooth.BluetoothGattCharacteristic.WRTIE_TYPE_DEFAULT);
	    if (cuuid === ptDataChar) {
		pushTrackerDataCharacteristic = c;
	    }
	    appService.addCharacteristic(c);
	});
    }
    catch (ex) {
        console.log(ex);
    }
}

function notifyPushTrackers(pushTrackers) {
    pushTrackers.map((pt) => {
        bluetooth._gattServer.notifyCharacteristicChanged(pt, pushTrackerDataCharacteristic, false);
    });
}

function disconnectPushTrackers(pushTrackers) {
    try {
        pushTrackers.map((pt) => {
            bluetooth.cancelServerConnection(pt);
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

function selectPushTrackers() {
    const pts = getConnectedPushTrackers();
    if (pts.length > 1) {
        const options = {
            message: "Select PushTracker",
            actions: pts.map((pt) => { return `${pt}`; }).concat(['All'])
        };

        return selectDialog(options)
            .then((selection) => {
                if (selection) {
                    if (selection === 'All') {
                        return pts;
                    }
                    else {
                        return pts.filter((pt) => { return `${pt}` === selection; });
                    }
                }

                return null;
            })
            .catch((err) => {
                console.log(err);

                return null;
            });
    }
    else {
        return new Promise((resolve, reject) => {
            if (pts.length) {
                resolve(pts);
            }
            else {
                reject();
            }
        });
    }
}

function isSmartDrive() {
}

function getConnectedSmartDrives() {
    return dev.getName() === "SmartDrive DU" ||
	dev.getUuids().indexOf(smartDriveServiceUUID) > -1;
}

function isPushTracker(dev) {
    console.log(dev.fetchUuidsWithSdp());
    console.log(dev.getName());
    console.log(dev.getUuids());
    return true;
    /*
    return dev.getName() === "PushTracker" ||
	dev.getUuids().indexOf(pushTrackerServiceUUID) > -1;
    */
}

function getConnectedPushTrackers() {
    try {
        const pushTrackers = [];
        const pts = bluetooth.getServerConnectedDevices();
        if (pts === null || pts === undefined || pts.size === undefined || pts.length === 0) {
            return pushTrackers;
        }
        for (let i = 0; i < pts.size(); i++) {
            const pt = pts.get(i);
	    if (isPushTracker(pt)) {
                pushTrackers.push(pt);
            }
        }

        return pushTrackers;
    }
    catch (ex) {
        console.log(ex);

        return [];
    }
}

function hasPushTrackerConnected() {
    try {
        const pts = getConnectedPushTrackers();

        return pts.length > 0;
    }
    catch (ex) {
        console.log(ex);

        return false;
    }
}

function sendToPushTracker(data) {
    if (pushTrackerDataCharacteristic === null || pushTrackerDataCharacteristic === undefined) {
        return;
    }
    pushTrackerDataCharacteristic.setValue(data);
};

function restart() {
    return new Promise((resolve, reject) => {
	// disable the bluetooth
	bluetooth.disable();
	// wait then re-enable it
	setTimeout(() => {
	    bluetooth.enable().then((enabled) => {
		resolve();
	    });
	}, 250); // wait 250 ms
    });
}

// original
exports.sendToPushTracker = sendToPushTracker;
exports.pushTrackerDataCharacteristic = pushTrackerDataCharacteristic;
exports._bluetooth = bluetooth;
exports.isPeripheralModeSupported = bluetooth.isPeripheralModeSupported;
exports.isBluetoothEnabled = bluetooth.isBluetoothEnabled;
exports.setDiscoverable = bluetooth.setDiscoverable;
exports.startAdvertising = bluetooth.startAdvertising;
exports.stopAdvertising = bluetooth.stopAdvertising;
exports.disable = bluetooth.disable;
exports.enable = bluetooth.enable;
// what we add / wrap
exports.initialize = initialize;
exports.hasServices = hasServices;
exports.restart = restart;
exports.notifyPushTrackers = notifyPushTrackers;
exports.disconnectPushTrackers = disconnectPushTrackers;
exports.getConnectedPushTrackers = getConnectedPushTrackers;
exports.hasPushTrackerConnected = hasPushTrackerConnected;
exports.selectPushTrackers = selectPushTrackers;
exports.addServices = addServices;
exports.peripherals = peripherals;
exports.clearPeripherals = clearPeripherals;
exports.stopScanning = stopScanning;
exports.scanForAny = scanForAny;
exports.scanForSmartDrive = scanForSmartDrive;
