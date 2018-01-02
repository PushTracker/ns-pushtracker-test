export module Models {
    export interface ISmartDriveSettings {
    }

    export interface IUserSettings {
	username: string;
	fullname: string;
	email: string;
    }

    export interface IDailyInfo {
	year: number;
	month: number;
	day: number;
	pushesWith: number;
	pushesWithout: number;
	coastWith: number;
	coastWithout: number;
	distance: number;
	speed: number;
	ptBattery: number;
	sdBattery: number;
	date: number;
    }
}
