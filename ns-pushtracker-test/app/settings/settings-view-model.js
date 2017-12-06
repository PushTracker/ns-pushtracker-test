const observableModule = require("data/observable");
const observableArray = require("tns-core-modules/data/observable-array");
const frameModule = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");

const bluetooth = require("nativescript-bluetooth");

function SettingsViewModel() {
    const viewModel = observableModule.fromObject({
        doIsBluetoothEnabled: function() {
            bluetooth.isBluetoothEnabled().then(function(enabled) {
                dialogs.alert({
                    title: "Enabled?",
                    message: enabled ? "Yes" : "No",
                    okButtonText: "OK, Thanks"
                });
            });
        },

        doEnableBluetooth: function() {
            bluetooth.enable().then(function(enabled) {
                dialogs.alert({
                    title: "Did the user allow enabling Bluetooth by our app?",
                    message: enabled ? "Yes" : "No",
                    okButtonText: "OK, nice!"
                });
            });
        },

        peripherals: new observableArray.ObservableArray(),

        onPeripheralTap: function(args) {
            var that = this;
            var index = args.index;
            var peri = that.peripherals.getItem(index);
            console.log("selected: "+peri.UUID);

            var navigationEntry = {
                moduleName: "bluetooth/services-page",
                context: {
                    info: "something you want to pass to your page",
                    foo: "bar",
                    peripheral: peri
                },
                animated: true
            };
            var topmost = frameModule.topmost();
            topmost.navigate(navigationEntry);
        },

        doScanForSmartDrive: function() {
            var that = this;
            var smartDriveServiceUUID = "0cd51666-e7cb-469b-8e4d-2742f1ba7723";
            that.set("isLoading", true);
            that.peripherals.splice(0, that.peripherals.length);
            bluetooth.startScanning({
                serviceUUIDs: [smartDriveServiceUUID],
                seconds: 4,
                onDiscovered: function(peripheral) {
                    that.peripherals.push(observableModule.fromObject(peripheral));
                }
            })
            .then(function() {
                that.set("isLoading", false);
            })
            .catch(function(err) {
                that.set("isLoading", false);
                dialogs.alert({
                    title: "Whoops",
                    message: err,
                    okButtonText: "OK, got it."
                });
            });
        },

        doStartScanning: function() {
            var that = this;
            that.set("isLoading", true);
            that.peripherals.splice(0, that.peripherals.length);
            bluetooth.startScanning({
                serviceUUIDs: [],
                seconds: 4,
                onDiscovered: function(peripheral) {
                    that.peripherals.push(observableModule.fromObject(peripheral));
                }
            })
            .then(function() {
                that.set("isLoading", false);
            })
            .catch(function(err) {
                that.set("isLoading", false);
                dialogs.alert({
                    title: "Whoops",
                    message: err,
                    okButtonText: "OK, got it."
                });
            });
        },

        doStopScanning: function() {
            var that = this;
            bluetooth.stopScanning().then(function() {
                that.set("isLoading", false);
            })
            .catch(function(err) {
                dialogs.alert({
                    title: "Whoops",
                    message: err,
                    okButtonText: "OK, that's fine"
                });
            });
        }
    });

    return viewModel;
}

module.exports = SettingsViewModel;
