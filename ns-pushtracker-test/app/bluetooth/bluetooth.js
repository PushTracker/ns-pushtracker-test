const observableModule = require("data/observable");
const observableArray = require("data/observable-array");

const bluetooth = require("nativescript-bluetooth");

const smartDriveServiceUUID = "0cd51666-e7cb-469b-8e4d-2742f1ba7723";

const peripherals = new observableArray.ObservableArray();

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

// original 
exports._bluetooth = bluetooth;
exports.isPeripheralModeSupported = bluetooth.isPeripheralModeSupported;
exports.isBluetoothEnabled = bluetooth.isBluetoothEnabled;
exports.enable = bluetooth.enable;
// what we add / wrap
exports.peripherals = peripherals;
exports.clearPeripherals = clearPeripherals;
exports.stopScanning = stopScanning;
exports.scanForAny = scanForAny;
exports.scanForSmartDrive = scanForSmartDrive;
