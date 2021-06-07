module.exports = {
    metadata: {
        family: "msr", // plugin name
        plugin: "smartengine", // file name
        label: "Smartengine",
        actorTypes: [],
        sensorTypes: [],
        services: [],
        configuration: [{
            label: "Username",
            id: "username",
            type: {
                id: "string"
            },
            defaultValue: ""
        }, {
            label: "Password",
            id: "password",
            type: {
                id: "string"
            },
            defaultValue: ""
        },
        {
            label: "Project Id",
            id: "projectId",
            type: {
                id: "string"
            },
            defaultValue: ""
        }],
        state: []
    },
    create: () => new Smartengine()
};

const makeMethodsEnumerable = require('./utils/enumeratedClass');
const SmartengineAPI = require('./lib/smartengine/smartengineAPI');
const EventEmitter = require('events');

Promise.prototype.fail = Promise.prototype.catch;

class Smartengine {
    async start() {
        this.operationalState = {
            status: 'PENDING',
            message: 'Waiting for initialization...'
        };
        this.publishOperationalStateChange();

        const username = this.configuration.username,
            password = this.configuration.password;

        this.logDebug("Starting Smartengine: " + JSON.stringify(this.configuration));

        this.smartengine = new SmartengineAPI(username, password, this.configuration.projectId);

        try {
            await this.smartengine.getCookieAccess();
            await this.smartengine.start();
        } catch (e) {
            console.log(e.message)
        }

        this.operationalState = {
            status: 'OK',
            message: 'Smartengine successfully initialized'
        };

        this.publishOperationalStateChange();
    }

    async stop() {
        this.smartengine.stop();
    }

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
    }

}
makeMethodsEnumerable(Smartengine);