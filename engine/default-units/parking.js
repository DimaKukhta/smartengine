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

class Parking {
    constructor() {
        this.state = {
            countOfFreePlaces: 0,
            isReserved: false
        }
    }

    async start() {
        this.operationalState = {
            status: 'PENDING',
            message: 'Waiting for initialization...'
        };
        this.publishOperationalStateChange();

        this.state.countOfFreePlaces = await this.getData(this.configuration.parkingId);

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
        if (freePlaces === -1) {
            console.log('Error: with response');
        } else {
            this.state.countOfFreePlaces = freePlaces;
        }
    }

    async reserve() {
        this.state.isReserved = await this.device.reserveParkingPlace(this.configuration.parkingId);
    }

    async release() {
        const isReleased = await this.device.releaseParkingPlace(this.configuration.parkingId);
        if (isReleased) {
            this.state.isReserved = false
        } else {
            console.log('Error with release place');
        }
    }
}
