require("./bundle-config");
const application = require("application");

const bluetooth = require("./bluetooth/bluetooth");

bluetooth.addServices();

application.start({ moduleName: "home/home-page" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
