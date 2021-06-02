module.exports = {
    metadata: {
        family: "parking",
        plugin: "parking",
        label: "Parking",
        role: "actor",
        deviceTypes: ["msr/smartengine"],
        services: [
            {
                id: "getData",
                label: "Get data about free places"
            },
            {
                id: "reserve",
                label: "Reserve"
            },
            {
                id: "release",
                label: "Release"
            }
        ],
        configuration: [
            {
                label: "Parking ID", // id parking place
                id: "parkingId",
                type: {
                    id: "string"
                },
                defaultValue: ''
            }
        ],
        state: [{
            id: "isReserved",
            label: "Is Reserved",
            type: {
                id: "boolean"
            }
        }, {
            id: "countOfFreePlaces",
            label: "Count of free places",
            type: {
                id: "number"
            }
        }]
    },
    create: function (device) {
        return new Parking();
    }
};

const makeMethodsEnumerable = require('../utils/enumeratedClass');

Promise.prototype.fail = Promise.prototype.catch;

class Parking {

    async start() {
        this.operationalState = {
            status: 'PENDING',
            message: 'Waiting for initialization...'
        };
        this.publishOperationalStateChange();

        this.state = {
            countOfFreePlaces: 0,
            isReserved: false
        }

        this.logDebug('Device start');

        this.publishStateChange();

        await this.getData();

        this.operationalState = {
            status: 'OK',
            message: 'foil successfully initialized'
        };
        this.publishOperationalStateChange();
    }

    async stop() {

    }

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
        this.publishStateChange();
    }

    async getData() {
        try {
            this.state.countOfFreePlaces = await this.device.smartengine.getData(this.device.cookie, this.configuration.parkingId);
            this.logDebug('Free places is', this.state.countOfFreePlaces);
        } catch (e) {
            console.log('Error with getData method:', e.message);
        }
    }

    async reserve() {
        try {
            this.state.isReserved = await this.device.smartengine.reserveParkingPlace(this.device.cookie, this.configuration.parkingId);
            this.state.countOfFreePlaces = await this.device.smartengine.getData(this.device.cookie, this.configuration.parkingId);
        } catch (e) {
            console.log('Error with reserve method', e.message);
        }
    }

    async release() {
        try {
            this.state.isReserved = !await this.device.smartengine.releaseParkingPlace(this.device.cookie, this.configuration.parkingId);
            this.state.countOfFreePlaces = await this.device.smartengine.getData(this.device.cookie, this.configuration.parkingId);
        } catch (e) {
            console.log('Error with release place:', e.message);
        }
    }
}

makeMethodsEnumerable(Parking);
