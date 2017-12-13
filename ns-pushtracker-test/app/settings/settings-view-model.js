const observableModule = require("data/observable");

function SettingsViewModel() {
    const viewModel = observableModule.fromObject({
        // SETTINGS

        controlModes: [
            {
                name: "MX1"
            },
            {
                name: "MX2"
            },
            {
                name: "MX2+"
            }
        ],
        controlModeSelection: 2,
        onControlModeSelected: function(propertyChangeData) {
            this.controlModeSelection = propertyChangeData.newIndex;
        },
        getControlMode: function() {
            return this.controlModes[this.controlModeSelection];
        },

        ezOn: false,

        units: [
            {
                name: "English"
            },
            {
                name: "Metric"
            }
        ],
        unitsSelection: 0,
        onUnitsSelected: function(propertyChangeData) {
            this.unitsSelection = propertyChangeData.newIndex;
        },
        getUnits: function() {
            return this.units[this.unitsSelection];
        },

        acceleration: 30,
        maxSpeed: 70,
        tapSensitivity: 100,

        getAccelerationLabel: function() {
            return `${this.acceleration}%`;
        },

        getMaxSpeedLabel: function() {
            return `${this.maxSpeed}%`;
        },

        getTapSensitivityLabel: function() {
            return `${this.tapSensitivity}%`;
        }
    });

    return viewModel;
}

module.exports = SettingsViewModel;
