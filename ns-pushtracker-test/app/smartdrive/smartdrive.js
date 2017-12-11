const Packet = require("../packet/packet");
const bluetooth = require("nativescript-bluetooth");

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

function sendTap(peri) {
    const peripheral = this || peri;
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

// info
exports.Characteristics = smartDriveChars;
exports.UUID = smartDriveUUID;
exports.dataChar = dataCharacteristic;
exports.controlChar = controlCharacteristic;

// functions
exports.sendTap = sendTap;
