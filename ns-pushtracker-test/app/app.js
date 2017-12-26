require("./bundle-config");
const application = require("application");

const firebase = require("nativescript-plugin-firebase");

firebase.init({
    // pass in properties for the database, authentication, and messaging
    // see their docs
    persist: true
}).then(
    function (instance) {
	console.log("firebase.init done");
	bluetooth.initialize();
    },
    function (error) {
	console.log("firebase.init error: " + error);
    }
);

const bluetooth = require("./bluetooth/bluetooth");

application.on(application.launchEvent, function(args) {
    console.log("App launching...");
});

application.start({ moduleName: "home/home-page" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
