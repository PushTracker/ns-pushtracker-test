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
        },

	toObject: function() {
	    var obj = {
		controlMode: this.getControlMode().name,
		ezOn: this.ezOn,
		units: this.getUnits().name,
		acceleration: this.acceleration,
		maxSpeed: this.maxSpeed,
		tapSensitivity: this.tapSensitivity
	    };
	    return obj;
	},

	fromObject: function(obj) {
	    let cm = this.controlModes.map((c) => { return c.name }).indexOf(obj.controlMode);
	    let un = this.units.map((u) => { return u.name }).indexOf(obj.units);

	    if (cm < 0) cm = 2;
	    if (un < 0) un = 0;
	    
	    this.controlModeSelection = cm;
	    this.ezOn = obj.ezOn;
	    this.unitsSelection = un;
	    this.acceleration = obj.acceleration;
	    this.maxSpeed = obj.maxSpeed;
	    this.tapSensitivity = obj.tapSensitivity;
	}
    });

    return viewModel;
}

module.exports = SettingsViewModel;
