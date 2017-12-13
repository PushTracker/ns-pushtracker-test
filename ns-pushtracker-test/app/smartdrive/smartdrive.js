const Packet = require("../packet/packet");
const Binding = require("../packet/packet_bindings");
const bluetooth = require("nativescript-bluetooth");
const Q = require("q");

const smartDriveUUID = "0cd51666-e7cb-469b-8e4d-2742f1ba7723";
const smartDriveChars = [
  "e7add780-b042-4876-aae1-112855353cc1",
  "e8add780-b042-4876-aae1-112855353cc1",
  "e9add780-b042-4876-aae1-112855353cc1",
  "eaadd780-b042-4876-aae1-112855353cc1",
  "ebadd780-b042-4876-aae1-112855353cc1"
];

const dataCharacteristic = smartDriveChars[1];
const controlCharacteristic = smartDriveChars[2];

function peripheralIsSmartDrive(peri) {
    const peripheral = peri;
    if (peripheral === null || peripheral === undefined || peripheral.state !== "connected") {
        return false;
    }
    const sdServices = peripheral.services.filter((v) => {
        return (v.UUID === smartDriveUUID);
    });

    return sdServices.length > 0;
}

function sendSettings(peri, settings) {
    const peripheral = peri;
    if (peripheral === null || peripheral === undefined || peripheral.state !== "connected") {
        console.log("SmartDrive no longer connected, not sending settings");

        return;
    }
    try {
        const cm = settings.getControlMode().name;
        const u = settings.getUnits().name;

        const p = new Packet.Packet();
        const settingsData = p.data("settings");

        let controlMode = "Off";
        let units = "English";

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

        settingsData.ControlMode = Binding.SmartDriveControlMode[controlMode];
        settingsData.Units = Binding.Units[units];
        settingsData.Flags = settings.ezOn ? 1 : 0;
        settingsData.Padding = 0;
        settingsData.TapSensitivity = settings.tapSensitivity / 100.0;
        settingsData.Acceleration = settings.acceleration / 100.0;
        settingsData.MaxSpeed = settings.maxSpeed / 100.0;
        p.Type("Command");
        p.SubType("SetSettings");
        p.data("settings", settingsData);

        const data = p.toBuffer();
        console.log(`Sending Settings =>  ${Packet.toString(data)}`);
        bluetooth.write({
            peripheralUUID: peripheral.UUID,
            serviceUUID: smartDriveUUID,
            characteristicUUID: controlCharacteristic,
            value: data
        });
        // free up memory
        p.destroy();
    }
    catch (ex) {
        console.log("error sending settings");
        console.log(ex);
        console.log(ex.fileName);
        console.log(ex.lineNumber);
    }
}

function sendTap(peri) {
    const peripheral = peri;
    if (peripheral === null || peripheral === undefined || peripheral.state !== "connected") {
        console.log("SmartDrive no longer connected, not sending tap");

        return;
    }
    const tapData = Packet.makePacketData("Command", "Tap");
    console.log(`SENDING TAP =>  ${Packet.toString(tapData)}`);
    bluetooth.write({
        peripheralUUID: peripheral.UUID,
        serviceUUID: smartDriveUUID,
        characteristicUUID: controlCharacteristic,
        value: tapData
    });
}

const notificationInterval = 1000; // ms

function connect(peri, onNotify) {
    const deferred = Q.defer();
    const peripheral = peri;
    if (peripheral === null || peripheral === undefined || peripheral.state !== "connected") {
        deferred.resolve();

        return deferred.promise;
    }
    if (peripheralIsSmartDrive(peripheral)) {
        let i = 0;
        const promises = smartDriveChars.map((c) => {
            const d = Q.defer();
            setTimeout(() => {
                console.log(`subscribing to: ${c}`);
                bluetooth.startNotifying({
                    peripheralUUID: peripheral.UUID,
                    serviceUUID: smartDriveUUID,
                    characteristicUUID: c,
                    onNotify: onNotify
                });
                d.resolve();
            }, i * notificationInterval);
            i++;

            return d.promise;
        });

        Q.all(promises).then(() => {
            console.log("connected to SmartDrive!");
            deferred.resolve();
        });
    }
    else {
        deferred.resolve();
    }

    return deferred.promise;
}

function disconnect(peri) {
    const deferred = Q.defer();
    const peripheral = peri;
    if (peripheral === null || peripheral === undefined || peripheral.state !== "connected") {
        deferred.resolve();

        return deferred.promise;
    }
    if (peripheralIsSmartDrive(peripheral)) {
        const promises = smartDriveChars.map((c) => {
            const d = Q.defer();
            console.log(`unsubscribing from: ${c}`);
            bluetooth.stopNotifying({
                peripheralUUID: peripheral.UUID,
                serviceUUID: smartDriveUUID,
                characteristicUUID: c
            }).then(() => {
                d.resolve();
            }).catch((err) => {
                console.log(`Error disconnecting from SD: ${err}`);
                d.resolve();
            });

            return d.promise;
        });

        Q.all(promises).then(() => {
            console.log("disconnected from SmartDrive!");
            deferred.resolve();
        });
    }
    else {
        deferred.resolve();
    }

    return deferred.promise;
}

// info
exports.Characteristics = smartDriveChars;
exports.UUID = smartDriveUUID;
exports.dataChar = dataCharacteristic;
exports.controlChar = controlCharacteristic;

// functions
exports.connect = connect;
exports.disconnect = disconnect;
exports.sendTap = sendTap;
exports.sendSettings = sendSettings;
exports.peripheralIsSmartDrive = peripheralIsSmartDrive;
