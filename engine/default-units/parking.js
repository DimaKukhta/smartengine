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

        this.publishStateChange();

        this.logDebug("State of parking is: " + JSON.stringify(this.state));

        await this.getData();

        this.logDebug('State after:', JSON.stringify(this.state));

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
        const freePlaces = await this.device.getData(this.configuration.parkingId);
        this.logDebug('Free places', JSON.stringify(freePlaces));
        if (freePlaces !== -1) {
            this.state.countOfFreePlaces = freePlaces;
        }
    }

    async reserve() {
        this.logDebug('Reserve', this.state.isReserved );
        this.state.isReserved = await this.device.reserveParkingPlace(this.configuration.parkingId);
        this.logDebug('Reserve', this.state.isReserved );
    }

    async release() {
        const isReleased = await this.device.releaseParkingPlace(this.configuration.parkingId);
        this.logDebug('Released', isReleased)
        if (isReleased) {
            this.state.isReserved = false
        }
    }
}

makeMethodsEnumerable(Parking);
