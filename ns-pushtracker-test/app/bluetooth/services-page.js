const observableArray = require("tns-core-modules/data/observable-array");
const observable = require("tns-core-modules/data/observable");
const frameModule = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const bluetooth = require("nativescript-bluetooth");

const GaugesModule = require("nativescript-pro-ui/gauges");

const Packet = require("../packet/packet");
const SmartDrive = require("../smartdrive/smartdrive.js");

let page = null;
let _peripheral = null;
let _settings = null;
let receivedData = null;
let smartDrivePeripheral = null;

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

const maxReceivedData = 10;
function onNotify(result) {
  const data = new Uint8Array(result.value);
  const p = new Packet.Packet(data);

  if (p.Type() === "Data" && p.SubType() === "MotorInfo") {
    currentSpeed = p.data("motorInfo").speed;
    //console.log(`Current speed = ${currentSpeed} mph`);
    updateSpeedDisplay(currentSpeed);
  }

  receivedData.push(observable.fromObject({
    type: p.Type(),
    subtype: p.SubType(),
    data: Packet.toString(data)
  }));
  if (receivedData.length > maxReceivedData) {
    receivedData.splice(0, receivedData.length - maxReceivedData);
  }
  updateDataListHeight(40 * receivedData.length);
  p.destroy();
}

function updateServicesListHeight(h) {
    if (page === null) {
        return;
    }
    // update height of the list view accordingly
    const servicesList = page.getViewById("services");
    if (servicesList !== null && servicesList !== undefined) {
        servicesList.height = h;
    }
}

function updateDataListHeight(h) {
    if (page === null) {
        return;
    }
    // update height of the list view accordingly
    const dataList = page.getViewById("data");
    if (dataList !== null && dataList !== undefined) {
        dataList.height = h;
    }
}

function updateConnectionButtonText() {
  if (page === null) {
    return;
  }
  const button = page.getViewById("connection");
  if (button !== null && button !== undefined) {
    button.text = _peripheral.get("connected") ? "Disconnect" : "Connect";
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
  connect();
  initAccel();
}

function onNavigatingFrom() {
  stopAccel();
  disconnect();
}

function onConnectionTap(args) {
  if (_peripheral.get("connected")) {
    disconnect();
  }
  else {
    connect();
  }
}

function onTapTap() {
  if (smartDrivePeripheral === null) {
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

function disconnect() {
  // if we're a smartDrive, unsubscribe from all characteristics
  SmartDrive.disconnect(_peripheral.get("peripheral")).then(() => {
    console.log(`Disconnecting peripheral ${_peripheral.UUID}`);
    bluetooth.disconnect(
      {
        UUID: _peripheral.UUID
      }
    ).then(() => {
      },
      (err) => {
        console.log(err);
        // still going back to previous page
        frameModule.topmost().navigate({
          moduleName: "settings/settings-page",
          animated: true,
          transition: {
            name: "slideRight"
          }
        });
      }
    );
  });
}

function connect() {
  _peripheral.set("connected", false);
  const discoveredServices = new observableArray.ObservableArray();
  receivedData = new observableArray.ObservableArray();
  page.bindingContext = _peripheral;
  _peripheral.set("isLoading", true);
    bluetooth.connect(
    {
      UUID: _peripheral.UUID,
      // NOTE: we could just use the promise as this cb is only invoked once
      onConnected: function (peripheral) {
        _peripheral.set("connected", true);
        updateConnectionButtonText();
        //console.log("------- Peripheral connected: " + JSON.stringify(peripheral));
        peripheral.services.forEach((value) => {
          //console.log("---- ###### adding service: " + value.UUID);
          discoveredServices.push(observable.fromObject(value));
        });

        //updateServicesListHeight(40 * peripheral.services.length);

        _peripheral.set("isLoading", false);
        _peripheral.set("services", discoveredServices);
        _peripheral.set("peripheral", peripheral);
        _peripheral.set("receivedData", receivedData);
        
        _peripheral.set("isSmartDrive", true);

        // if this is a smartDrive, subscribe to characteristics
        if (SmartDrive.peripheralIsSmartDrive(peripheral)) {
          _peripheral.set("isSmartDrive", true);
          smartDrivePeripheral = peripheral;
          // connect 
          SmartDrive.connect(peripheral, onNotify).then(() => {
            // what do we want to do here? send settings?
            SmartDrive.sendSettings(peripheral, _settings);
            Toast.makeText(`Sent Settings (${_settings.getControlMode().name}, ${_settings.acceleration}, ${_settings.maxSpeed})`).show();
          });
        }
      },
      onDisconnected: function (peripheral) {
        // let the user know we were disconnected
        _peripheral.set("connected", false);
        updateConnectionButtonText();
        dialogs.alert({
          title: "Disconnected",
          message: `Disconnected from peripheral: ${JSON.stringify(peripheral)}`,
          okButtonText: "OK, thanks"
        });
      }
    }
  );
}

function onServiceTap(args) {
  const index = args.index;
  const service = _peripheral.get("services").getItem(index);
  console.log(`--- service selected: ${service.UUID}`);

  const navigationEntry = {
    moduleName: "bluetooth/characteristics-page",
    context: {
      peripheral: _peripheral,
      service: service
    },
    animated: true
  };
  const topmost = frameModule.topmost();
  topmost.navigate(navigationEntry);
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
exports.onServiceTap = onServiceTap;
exports.onConnectionTap = onConnectionTap;
exports.onBackTap = onBackTap;
exports.onTapTap = onTapTap;
