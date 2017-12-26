require("./bundle-config");
const application = require("application");

const bluetooth = require("./bluetooth/bluetooth");
bluetooth.initialize();

const firebase = require("nativescript-plugin-firebase");

firebase.init({
    // pass in properties for the database, authentication, and messaging
    // see their docs
    persist: true
}).then(
    function (instance) {
	console.log("firebase.init done");
    },
    function (error) {
	console.log("firebase.init error: " + error);
    }
);

application.start({ moduleName: "home/home-page" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
