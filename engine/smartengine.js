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

class Smartengine {
    constructor() {
        this.cookie = null;
        this.isAuth = false;
    }
    async start() {
        this.parkingId = parkingId
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
        http.request(options, (res) => {
            if (res.statusCode === 200) {
                this.cookie = res.headers['set-cookie'][0].split(';')[0];
                this.isAuth = true;
            }
        }).on('error', (e) => {
            console.error(e);
        });
    }

    async getData(parkingId) {
        let body = [];

        const options = {
            host: 'parkgard.msr-traffic.de',
            path: `/msrpocking/${this.configuration.projectId}/get?id=${parkingId}`,
            method: 'GET',
            headers: {
                'Cookie': `session=${this.cookie}`,
            }
        };

        const req = https.request(options, (res) => {
            res.on('data', (chunk) => {
                body.push(chunk);
            })

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const responseResult = JSON.parse(Buffer.concat(body).toString());
                        return responseResult.free_spaces;
                    } catch (error) {
                        console.log('Error with parsing data:', error.message);
                        return -1;
                    }
                }
            })
        });

        req.on('error', (e) => {
            console.error(e);
            return -1;
        });
    }

    async reserveParkingPlace(parkingId) {
        const countOfFreePlace = await this.getData(parkingId);
        const options = {
            host: 'parkgard.msr-traffic.de',
            path: `/msrpocking/${this.configuration.projectId}/reserve?id=${parkingId}`,
            method: 'POST',
            headers: {
                'Cookie': `session=${this.cookie}`,
            }
        };

        if (countOfFreePlace) {
            https.request(options, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    return true;
                }
            });
        }
        console.log('All places are taken');
        return false;

    }

    async releaseParkingPlace(parkingId) {
        const options = {
            host: 'parkgard.msr-traffic.de',
            path: `/msrpocking/${this.configuration.projectId}/release?id=${parkingId}`,
            method: 'POST',
            headers: {
                'Cookie': `session=${this.cookie}`,
            }
        };
        https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                return true;
            }
            console.log('Error with release place');
            return false;
        });
    }
}