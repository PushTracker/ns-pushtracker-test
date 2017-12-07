const frameModule = require("ui/frame");

const MapViewModel = require("./map-view-model");

const mapbox = require("nativescript-mapbox");

let markerId = 0;

function placeMarker(point) {
    const map = this;
    const myId = new Date().getTime();
    map.addMarkers([
        {
            id: myId,
            lat: point.lat,
            lng: point.lng,
            title: "New Marker " + ++markerId,
            onTap: function() { console.log("Marker was tapped");},
            onCalloutTap: function() {console.log("Callout was tapped"); map.removeMarkers([myId]);}
        }
    ]);
}

function onMapReady(args) {
    var nativeMapView = args.ios ? args.ios : args.android;
    console.log("Mapbox onMapReady for " + (args.ios ? "iOS" : "Android") + ", native object received: " + nativeMapView);

    args.map.setCenter({
        lat: 52.36,
        lng: 4.8891
    });

    args.map.setOnMapClickListener(placeMarker.bind(args.map));
}

function onFabTap(args) {
    console.log("FAB Tapped");
}

/* ***********************************************************
* Use the "onNavigatingTo" handler to initialize the page binding context.
*************************************************************/
function onNavigatingTo(args) {
    /* ***********************************************************
    * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
    * Skipping the re-initialization on back navigation means the user will see the
    * page in the same data state that he left it in before navigating.
    *************************************************************/
    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;
    page.bindingContext = new MapViewModel();
}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
    const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.onMapReady = onMapReady;
exports.onFabTap = onFabTap;
