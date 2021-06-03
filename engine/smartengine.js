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

class Smartengine extends EventEmitter {
    constructor() {
        super();
        console.log('start smarengine');
        this.cookie = null;
        this.isAuth = false;
    }
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

        await this.setCookieAccess();

        console.log(this.cookie)

        if (this.isAuth) {
            this.timer = setInterval(async () => {
                const data = await this.smartengine.getData(this.cookie);
                this.emit('updateData', data);
            }, 5000);
        }

        this.operationalState = {
            status: 'OK',
            message: 'Smartengine successfully initialized'
        };

        this.publishOperationalStateChange();
    }

    async setCookieAccess() {
        try {
            this.cookie = await this.smartengine.getCookieAccess();
            this.isAuth = true;
        } catch (e) {
            this.logDebug('Error with setCookie');
        }

    }

    async stop() {
        clearInterval(this.timer);
    }

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
    }

}
makeMethodsEnumerable(Smartengine);