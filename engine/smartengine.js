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
const http = require('http');
const https = require('https');

Promise.prototype.fail = Promise.prototype.catch;

class Smartengine {
    constructor() {
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

        await this.setCookieAccess(username, password);

        this.operationalState = {
            status: 'OK',
            message: 'Smartengine successfully initialized'
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
    }

    async setCookieAccess(username, password) {

        const options = {
            host: 'parkgard.msr-traffic.de',
            port: '13001',
            path: `/syslogin?name=${username}&password=${password}`,
            method: 'POST'
        };
        const req = http.request(options, (res) => {
            if (res.statusCode === 200) {
                this.cookie = res.headers['set-cookie'][0].split(';')[0];
                this.isAuth = true;
            }
        }).on('error', (e) => {
            console.error(e);
        });
        req.end();
    }

    async getData(parkingId) {
        let body = [];

        const options = {
            hostname: 'parkgard.msr-traffic.de',
            path: `/msrpocking/${this.configuration.projectId}/get?id=${parkingId}`,
            method: 'GET',
            headers: {
                'Cookie': `session=3165112017802051293`,
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                res.on('data', (chunk) => {
                    body.push(chunk);
                })

                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const responseResult = JSON.parse(Buffer.concat(body).toString());
                            resolve(responseResult.free_spaces);
                        } catch (error) {
                            throw new Error(`Error with parsing data: ${error.message}`);
                        }
                    }
                });

                req.on('error', (e) => {
                    throw new Error(`Error with getData request: ${e.message}`);
                });
            });
            req.end()
        });
    }

    async reserveParkingPlace(parkingId) {
        const countOfFreePlace = await this.getData(parkingId);
        const options = {
            host: 'parkgard.msr-traffic.de',
            path: `/msrpocking/${this.configuration.projectId}/reserve?id=${parkingId}`,
            method: 'POST',
            headers: {
                'Cookie': `${this.cookie}`,
            }
        };
        return new Promise((resolve, reject) => {
            if (countOfFreePlace) {
                const req = https.request(options, (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(true);
                    }
                    throw new Error('Error with requst to reserve place, status code invalid')
                });

                req.on('error', (e) => {
                    throw new Error(`Error with request reserve place ${e.message}`);
                })

                req.end();
            }
        })
    }

    async releaseParkingPlace(parkingId) {
        const options = {
            host: 'parkgard.msr-traffic.de',
            path: `/msrpocking/${this.configuration.projectId}/release?id=${parkingId}`,
            method: 'POST',
            headers: {
                'Cookie': `${this.cookie}`,
            }
        };
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(true);
                }
                throw new Error('Error with realese place, status code invalid');
            });

            req.on('error', (e) => {
                throw new Error(`Error with request release place ${e.message}`);
            })

            req.end();
        })
    }
}

makeMethodsEnumerable(Smartengine);