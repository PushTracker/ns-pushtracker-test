# NS-PUSHTRACKER-TEST

This app is a test platform for prototying the required functionality
of the PushTracker app within the NativeScript framework.

## Current Features

* Saving and loading of historical daily info on phone storage
* Saving and loading of SmartDrive settings on phone storage
* Interactive plotting of historical daily info (pinch zoom, with selection of time range)
* Multiple pages navigated through a drawer (slide-out, with button in action bar)
* Settings page for configuring smartDrive settings
* Save action item in action bar which prompts for which (of the connected PushTrackers) to send the settings to (with the option of sending the settings to *all* connected PushTrackers
* SmartDrive scanning and connection
* Real-time display of received SmartDrive speed
* Accelerometer based tap detection with configurable sensitivity
* Loading of OTA files for SD, SDBT, and PT
* Map my journey with topo map, user location, and marker placement

## TODO

* connect user account to server
* provide user account management
* save user location periodically during map my journey and plot it on the map
* load ota files from server
* synchronize settings and historical daily info with server
* create OTA interface and functionality to perform OTA with SD, SDBT, and PT
* create color control interface for controlling SD LED colors