const observableArray = require("tns-core-modules/data/observable-array");
const observable = require("tns-core-modules/data/observable");
const frameModule = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const bluetooth = require("nativescript-bluetooth");

const Packet = require("../packet/packet");
const SmartDrive = require("../smartdrive/smartdrive.js");

let page = null;
let _peripheral = null;
let receivedData = null;

function onNotify(result) {
  const data = new Uint8Array(result.value);
  const p = new Packet.Packet(data);
  receivedData.push(observable.fromObject({
    type: p.Type(),
    subtype: p.SubType(),
    data: Packet.toString(data)
  }));
  p.destroy();
}

function updateServicesListHeight(h) {
    if (page === null) {
        return;
    }
    // update height of the list view accordingly
    const servicesList = page.getViewById("services");
    if (servicesList !== null) {
        servicesList.height = h;
    }
}

function updateConnectionButtonText() {
  if (page === null) {
    return;
  }
  const button = page.getViewById("connection");
  if (button !== null) {
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
  connect();
}

function onConnectionTap(args) {
  if (_peripheral.get("connected")) {
    disconnect();
  }
  else {
    connect();
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

        updateServicesListHeight(40 * peripheral.services.length);

        _peripheral.set("isLoading", false);
        _peripheral.set("services", discoveredServices);
        _peripheral.set("peripheral", peripheral);
        _peripheral.set("receivedData", receivedData);
        
        _peripheral.set("isSmartDrive", true);

        // if this is a smartDrive, subscribe to characteristics
        if (SmartDrive.peripheralIsSmartDrive(peripheral)) {
          _peripheral.set("isSmartDrive", true);
          // connect 
          SmartDrive.connect(peripheral, onNotify).then(() => {
            // send double tap
            setTimeout(() => {
              SmartDrive.sendTap(peripheral);
            }, 1000);
            setTimeout(() => {
              SmartDrive.sendTap(peripheral);
            }, 1500);
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

exports.pageLoaded = pageLoaded;
exports.onServiceTap = onServiceTap;
exports.onConnectionTap = onConnectionTap;
exports.onBackTap = onBackTap;
