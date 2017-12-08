var observableArray = require("tns-core-modules/data/observable-array");
var observable = require("tns-core-modules/data/observable");
var frameModule = require("tns-core-modules/ui/frame");
var dialogs = require("tns-core-modules/ui/dialogs");
var bluetooth = require("nativescript-bluetooth");

var Packet = require("../packet/packet");

var _peripheral;

const smartDriveUUID = "0cd51666-e7cb-469b-8e4d-2742f1ba7723";
const smartDriveChars = [
  "e7add780-b042-4876-aae1-112855353cc1",
  "e8add780-b042-4876-aae1-112855353cc1",
  "e9add780-b042-4876-aae1-112855353cc1",
  "eaadd780-b042-4876-aae1-112855353cc1",
  "ebadd780-b042-4876-aae1-112855353cc1"
];

function getPacketData(type, subtype, key, data) {
  const p = new Packet();
  p.makePacket(type, subtype, key, data);
  var dataBuffer = p.writableBuffer();
  p.destroy();
  return printSmartDriveData(dataBuffer);
}

function printSmartDriveData(dataArray) {
  const str = dataArray.map(function(d) {
    return "0x" + d.toString(16).toUpperCase();
  });
  return str;
}

function pageLoaded(args) {
  var page = args.object;

  // might as well not load the rest of the page in this case (nav back)
  if (page.navigationContext === undefined) {
    return;
  }

  _peripheral = page.navigationContext.peripheral;
  var discoveredServices = new observableArray.ObservableArray();
  page.bindingContext = _peripheral;
  _peripheral.set('isLoading', true);

  bluetooth.connect(
    {
      UUID: _peripheral.UUID,
      // NOTE: we could just use the promise as this cb is only invoked once
      onConnected: function (peripheral) {
        //console.log("------- Peripheral connected: " + JSON.stringify(peripheral));
        peripheral.services.forEach(function(value) {
          //console.log("---- ###### adding service: " + value.UUID);
          discoveredServices.push(observable.fromObject(value));
        });

        const _isSmartDrive = peripheral.services.filter(function(v) {
          return v.UUID == smartDriveUUID;
        }).length > 0;

        // if this is a smartDrive, subscribe to characteristics
        if (_isSmartDrive) {
          var i = 0;
          smartDriveChars.map(function(c) {
            setTimeout(function() {
              console.log("subscribing to: "+c)
              bluetooth.startNotifying({
                peripheralUUID: peripheral.UUID,
                serviceUUID: smartDriveUUID,
                characteristicUUID: c,
                onNotify: function(result) {
                  //console.log("read: " + JSON.stringify(result));
                  //var data = new Uint8Array(result.value);
                  //console.log(printSmartDriveData(data));
                }
              });
            }, i * 1000);
            i++;
          });
          // send double tap
          var tapData = getPacketData("Command", "Tap");
          setTimeout(function() {
            console.log("SENDING FIRST TAP");
            bluetooth.write({
              peripheralUUID: peripheral.UUID,
              serviceUUID: smartDriveUUID,
              characteristicUUID: smartDriveChars[2],
              value: tapData
            });
            setTimeout(function() {
              console.log("SENDING SECOND TAP");
              bluetooth.write({
                peripheralUUID: peripheral.UUID,
                serviceUUID: smartDriveUUID,
                characteristicUUID: smartDriveChars[2],
                value: tapData
              });
            }, 500);
          }, 10000);
        }

        _peripheral.set('isLoading', false);
        _peripheral.set('services', discoveredServices);
      },
      onDisconnected: function (peripheral) {
        dialogs.alert({
          title: "Disconnected",
          message: "Disconnected from peripheral: " + JSON.stringify(peripheral),
          okButtonText: "OK, thanks"
        });
      }
    }
  );
}

function onServiceTap(args) {
  var index = args.index;
  var service = _peripheral.get("services").getItem(index);
  console.log("--- service selected: " + service.UUID);

  var navigationEntry = {
    moduleName: "bluetooth/characteristics-page",
    context: {
      peripheral: _peripheral,
      service: service
    },
    animated: true
  };
  var topmost = frameModule.topmost();
  topmost.navigate(navigationEntry);
}

function onDisconnectTap(args) {
  console.log("Disconnecting peripheral " + _peripheral.UUID);
  bluetooth.disconnect(
    {
      UUID: _peripheral.UUID
    }
  ).then(
    function() {
      // going back to previous page
      frameModule.topmost().navigate({
        moduleName: "settings/settings-page",
        animated: true,
        transition: {
          name: "slideRight"
        }
      });
    },
    function (err) {
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
}

exports.pageLoaded = pageLoaded;
exports.onServiceTap = onServiceTap;
exports.onDisconnectTap = onDisconnectTap;