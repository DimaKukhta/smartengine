const http = require('http');
const https = require('https');
const getCountOfFreePlacesOfParking = require('../../utils/countFromAllParking');

class SmartengineAPI {

    constructor(username, password, projectId) {
        this.username = username;
        this.password = password;
        this.projectId = projectId;
    }

    async getCookieAccess() {

        const options = {
            host: 'parkgard.msr-traffic.de',
            port: '13001',
            path: `/syslogin?name=${this.username}&password=${this.password}`,
            method: 'POST'
        };

        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.headers['set-cookie'][0].split(';')[0]);
                } else {
                    throw new Error('No access');
                }
            }).on('error', (e) => {
                throw new Error(e.message);
            });
            req.end();
        });
    }

    async getData(cookie) {
        let body = [];

        const options = {
            hostname: 'parkgard.msr-traffic.de',
            path: `https://parkgard.msr-traffic.de/msrpocking/${this.projectId}/all`,
            method: 'GET',
            headers: {
                'Cookie': `${cookie}`,
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
                            const responseResult = Object.values(JSON.parse(Buffer.concat(body).toString()));
                            resolve(responseResult);
                        } catch (error) {
                            throw new Error(`Error with parsing data: ${error.message}`);
                        }
                    }
                });
            });

            req.on('error', (e) => {
                throw new Error(`Error with getData request: ${e.message}`);
            })

            req.end();
        });
    }

    async reserveParkingPlace(cookie, parkingId) {
        const countOfFreePlace = getCountOfFreePlacesOfParking(await this.getData(cookie, parkingId), parkingId);
        console.log(countOfFreePlace)
        const options = {
            host: 'parkgard.msr-traffic.de',
            path: `/msrpocking/${this.projectId}/reserve?id=${parkingId}`,
            method: 'POST',
            headers: {
                'Cookie': `${cookie}`,
            }
        };
        return new Promise((resolve, reject) => {
            if (countOfFreePlace) {
                const req = https.request(options, (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(true);
                    } else {
                        throw new Error('Error with requst to reserve place, status code invalid')
                    }
                });

                req.on('error', (e) => {
                    throw new Error(`Error with request reserve place ${e.message}`);
                })

                req.end();
            }
        })
    }

    async releaseParkingPlace(cookie, parkingId) {
        const options = {
            host: 'parkgard.msr-traffic.de',
            path: `/msrpocking/${this.projectId}/release?id=${parkingId}`,
            method: 'POST',
            headers: {
                'Cookie': `${cookie}`,
            }
        };
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(true);
                } else {
                    throw new Error('Error with realese place, status code invalid');
                }
            });

            req.on('error', (e) => {
                throw new Error(`Error with request release place ${e.message}`);
            })

            req.end();
        })
    }
}

module.exports = SmartengineAPI;