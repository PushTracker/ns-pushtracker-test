const observableArray = require("tns-core-modules/data/observable-array");
const observable = require("tns-core-modules/data/observable");
const frameModule = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const bluetooth = require("nativescript-bluetooth");

//const GaugesModule = require("nativescript-pro-ui/gauges");

const Packet = require("../packet/packet");
const SmartDrive = require("../smartdrive/smartdrive.js");

let page = null;
let _peripheral = null;
let _settings = null;
let smartDrivePeripheral = null;

function currentSpeedData() {
  const a = new observableArray.ObservableArray();
  a.push(observable.fromObject({ timeStamp: new Date(2015, 1, 11).getTime(),
      Amount: 1 }));
  a.push(observable.fromObject({ timeStamp: new Date(2015, 2, 11).getTime(),
      Amount: 2 }));
  a.push(observable.fromObject({ timeStamp: new Date(2015, 3, 11).getTime(),
      Amount: 3 }));
  a.push(observable.fromObject({ timeStamp: new Date(2015, 4, 11).getTime(),
      Amount: 1 }));

  return a;
  /*
  return [
    { timeStamp: new Date(2015, 1, 11).getTime(),
      currentSpeed: 1.0 },
    { timeStamp: new Date(2015, 2, 11).getTime(),
      currentSpeed: 2.0 },
    { timeStamp: new Date(2015, 3, 11).getTime(),
      currentSpeed: 3.0 },
    { timeStamp: new Date(2015, 4, 11).getTime(),
      currentSpeed: 2.0 },
    { timeStamp: new Date(2015, 5, 11).getTime(),
      currentSpeed: 1.0 }
  ];//new observableArray.ObservableArray();
  */
}

let currentSpeed = 0;

const accelerometer = require("nativescript-accelerometer");
const Toast = require("nativescript-toast");

function initAccel() {
    stopAccel();
    const accelOptions = {
        sensorDelay: "game"
    };
    accelerometer.startAccelerometerUpdates(handleAccelData, accelOptions);
}

function updateSpeedDisplay(speed) {
    if (page === null) {
        return;
    }

    const gauge = frameModule.topmost().getViewById("gaugeView");
    gauge.title = `Current Speed:\n${speed.toFixed(2)} mph`;
    const scale = gauge.scales.getItem(0);
    const speedNeedle = scale.indicators.getItem(scale.indicators.length - 1);

    // update height of the list view accordingly
    //const speedNeedle = page.getViewById("speedNeedle");
    if (speedNeedle !== null && speedNeedle !== undefined) {
        speedNeedle.value = speed;
    }
}

function stopAccel() {
    try {
        accelerometer.stopAccelerometerUpdates();
        console.log("stopped accelerometer updates!");
    }
    catch (e) {
        //
    }
}

function handleAccelData(accelData) {
    //console.log(`(${accelData.x}, ${accelData.y}, ${accelData.z})`);
    let threshold = -1.1;
    if (_settings !== null && _settings.tapSensitivity) {
      threshold = -2.1 + (_settings.tapSensitivity / 100.0);
    }
    if (accelData && accelData.z < threshold) {
        //Toast.makeText("You tapped!").show();
        if (smartDrivePeripheral === null) {
          // don't do anything
        }
        else {
          SmartDrive.sendTap(smartDrivePeripheral);
        }
    }
}

function onNotify(result) {
  const data = new Uint8Array(result.value);
  const p = new Packet.Packet(data);

  if (p.Type() === "Data") {
    if (p.SubType() === "MotorInfo") {
      currentSpeed = p.data("motorInfo").speed;
      //console.log(`Current speed = ${currentSpeed} mph`);
      /*
      currentSpeedData.push(observable.fromObject({
        timeStamp: new Date(),
        "Current Speed": currentSpeed
      }));
      updateSpeedDisplay(currentSpeed);
      */
    }
  }
  else {
    Toast.makeText(`${p.Type()}::${p.SubType()}`).show();
  }
  p.destroy();
}

function updateConnectionButtonText(newText) {
  if (page === null) {
    return;
  }
  const button = page.getViewById("connection");
  if (button !== null && button !== undefined) {
    if (newText === null || newText === undefined || newText === "") {
      if (smartDrivePeripheral !== null) {
        switch (smartDrivePeripheral.state) {
          case "connecting":
            newText = "Connecting";
            break;
          case "connected":
            newText = "Disconnect";
            break;
          case "disconnecting":
            newText = "Disconnecting";
            break;
          case "disconnected":
            newText = "Connect";
            break;
          default:
            console.log(`unknown state: ${smartDrivePeripheral.state}`);
            newText = "Unknown";
            break;
        }
      }
      else {
        newText = "Connect";
      }
    }
    button.text = newText;
  }
}

function pageLoaded(args) {
  page = args.object;

  // might as well not load the rest of the page in this case (nav back)
  if (page.navigationContext === undefined) {
    return;
  }

  _peripheral = page.navigationContext.peripheral;
  _settings = page.navigationContext.settings;

  page.bindingContext = _peripheral;

  connect();
  initAccel();
}

function onNavigatingFrom() {
  stopAccel();
  disconnect();
}

function onConnectionTap(args) {
  if (smartDrivePeripheral !== null && smartDrivePeripheral.state === "connected") {
    disconnect();
  }
  else {
    connect();
  }
}

function onTapTap() {
  if (smartDrivePeripheral === null || smartDrivePeripheral.state !== "connected") {
    dialogs.alert({
      title: "Tap failed",
      message: "Not connected to a SmartDrive",
      okButtonText: "OK"
    });
  }
  else {
    SmartDrive.sendTap(smartDrivePeripheral);
  }
}

function onSettingsTap() {
  if (smartDrivePeripheral === null || smartDrivePeripheral.state !== "connected") {
    dialogs.alert({
      title: "Send Settings Failed",
      message: "Not connected to a SmartDrive",
      okButtonText: "OK"
    });
  }
  else {
    SmartDrive.sendSettings(smartDrivePeripheral, _settings);
    Toast.makeText(`Sent Settings (${_settings.getControlMode().name}, ${_settings.acceleration}, ${_settings.maxSpeed})`).show();
  }
}

function disconnect() {
  updateConnectionButtonText("Disconnecting");
  // if we're a smartDrive, unsubscribe from all characteristics
  SmartDrive.disconnect(smartDrivePeripheral).then(() => {
    console.log(`Disconnecting peripheral ${smartDrivePeripheral.UUID}`);
    bluetooth.disconnect(
      {
        UUID: smartDrivePeripheral.UUID
      }
    ).then(() => {
        smartDrivePeripheral.state = "disconnected";
        updateConnectionButtonText();
      },
      (err) => {
        smartDrivePeripheral.state = "disconnected";
        updateConnectionButtonText();
        console.log(err);
      }
    );
  });
}

function connect() {
  updateConnectionButtonText("Connecting");

  const discoveredServices = new observableArray.ObservableArray();
  bluetooth.connect({
    UUID: _peripheral.UUID,
    // NOTE: we could just use the promise as this cb is only invoked once
    onConnected: function (peripheral) {
      //console.log("------- Peripheral connected: " + JSON.stringify(peripheral));
      peripheral.services.forEach((value) => {
        //console.log("---- ###### adding service: " + value.UUID);
        discoveredServices.push(observable.fromObject(value));
      });

      _peripheral.set("peripheral", peripheral);
      
      // if this is a smartDrive, subscribe to characteristics
      if (SmartDrive.peripheralIsSmartDrive(peripheral)) {
        smartDrivePeripheral = peripheral;
        // connect 
        SmartDrive.connect(peripheral, onNotify).then(() => {
          // what do we want to do here? send settings?
          updateConnectionButtonText();
          /*
          setTimeout(() => {
            SmartDrive.sendSettings(peripheral, _settings);
            Toast.makeText(`Sent Settings (${_settings.getControlMode().name}, ${_settings.acceleration}, ${_settings.maxSpeed})`).show();
          }, 1000);
          */
        });
      }
      else {
        updateConnectionButtonText();
      }
    },
    onDisconnected: function (peripheral) {
      // let the user know we were disconnected
      smartDrivePeripheral.state = "disconnected";
      updateConnectionButtonText();
      dialogs.alert({
        title: "Disconnected",
        message: `Disconnected from peripheral: ${JSON.stringify(peripheral)}`,
        okButtonText: "OK, thanks"
      });
    }
  });
}

function onBackTap(args) {
  // going back to previous page
  frameModule.topmost().navigate({
    moduleName: "settings/settings-page",
    animated: true,
    transition: {
      name: "slideRight"
    }
  });
}

exports.currentSpeed = currentSpeed;
exports.pageLoaded = pageLoaded;
exports.onNavigatingFrom = onNavigatingFrom;
exports.onConnectionTap = onConnectionTap;
exports.onBackTap = onBackTap;
exports.onTapTap = onTapTap;
exports.onSettingsTap = onSettingsTap;
exports.currentSpeedData = currentSpeedData;
