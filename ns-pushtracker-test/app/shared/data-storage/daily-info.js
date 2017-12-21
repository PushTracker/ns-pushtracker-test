const Packet = require("../../packet/packet");

function DailyInfo(arr) {
    this.data = {
        year: 2017,
        month: 1,
        day: 1,
        pushesWith: 0,
        pushesWithout: 0,
        coastWith: 0,
        coastWithout: 0,
        distance: 0,
        speed: 0,
        ptBattery: 0,
        sdBattery: 0
    };
    if (arr !== null && arr !== undefined) {
        this.fromUint8Array(arr);
    }
}

DailyInfo.prototype.fromUint8Array = function(arr) {
    const p = new Packet.Packet(arr);
    this.fromPacket(p);
    p.destroy();
};

DailyInfo.prototype.fromPacket = function(p) {
    const di = p.data("dailyInfo");
    this.data = {
        year: di.year,
        month: di.month,
        day: di.day,
        pushesWith: di.pushesWith,
        pushesWithout: di.pushesWithout,
        coastWith: di.coastWith,
        coastWithout: di.coastWithout,
        distance: di.distance,
        speed: di.speed,
        ptBattery: di.ptBattery,
        sdBattery: di.sdBattery
    };
};

module.exports.DailyInfo = function(bytes) {
    return new DailyInfo(bytes);
};