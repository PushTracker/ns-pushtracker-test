const Binding = require("packet/packet_bindings");
const Packet = require("packet/packet");

function bindingTypeToString(bindingType, bindingValue) {
    let valueName = null;
    if (bindingType === null || bindingType === undefined ||
        bindingValue === null || bindingValue === undefined) {
        return valueName;
    }
    const names = Object.keys(Binding[bindingType]).filter((key) => {
        if (Binding[bindingType][key] === bindingValue) {
            return true;
        }
    });
    if (names.length === 1) {
        valueName = names[0];
    }

    return valueName;
}

function Settings() {
    this.data = {
        controlMode: "MX2+",
        units: "English",
        settingsFlags1: 0,
        tapSensitivity: 1.0,
        acceleration: 0.3,
        maxSpeed: 0.7
    };
}

Settings.prototype.controlModeToApp = function(cm) {
    let controlMode = "Off";
    switch (cm) {
        case "Beginner":
            controlMode = "MX1";
            break;
        case "Intermediate":
            controlMode = "MX2";
            break;
        case "Advanced":
            controlMode = "MX2+";
            break;
        default:
            break;
    }

    return controlMode;
};

Settings.prototype.appToControlMode = function(a) {
    let controlMode = "Off";
    switch (a) {
        case "MX1":
            controlMode = "Beginner";
            break;
        case "MX2":
            controlMode = "Intermediate";
            break;
        case "MX2+":
            controlMode = "Advanced";
            break;
        default:
            break;
    }

    return controlMode;
};

Settings.prototype.fromPacket = function(p) {
    const s = p.data("settings");
    this.data = {
        controlMode: Settings.controlModeToApp(bindingTypeToString(Binding.SmartDriveControlMode, s.controlMode)),
        units: bindingTypeToString(Binding.Units, s.units),
        settingsFlags1: s.settingsFlags1,
        tapSensitivity: s.tapSensitivity * 100.0,
        acceleration: s.acceleration * 100.0,
        maxSpeed: s.maxSpeed * 100.0
    };
};

Settings.prototype.serializable = function() {
    const p = new Packet.Packet();
    const settingsData = p.data("settings");

    const controlMode = Settings.appToControlMode(this.data.controlMode);
    const units = this.data.units;
    const settingsFlags = this.data.settingsFlags1;
    const tapSens = this.data.tapSensitivity / 100.0;
    const accel = this.data.acceleration / 100.0;
    const speed = this.data.maxSpeed / 100.0;

    settingsData.ControlMode = Binding.SmartDriveControlMode[controlMode];
    settingsData.Units = Binding.Units[units];
    settingsData.Flags = settingsFlags;
    settingsData.Padding = 0;
    settingsData.TapSensitivity = tapSens;
    settingsData.Acceleration = accel;
    settingsData.MaxSpeed = speed;
    p.Type("Command");
    p.SubType("SetSettings");
    p.data("settings", settingsData);
    const pdata = p.toUint8Array();
    p.destroy();

    return pdata;
};

exports.Settings = Settings;
