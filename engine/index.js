const https = require('https');

/*const options = {
    hostname: 'parkgard.msr-traffic.de',
    path: `/msrpocking/1/get?id=1-F-S007`,
    method: 'GET',
    headers: {
        'Cookie': `session=3165112017802051293`,
    }
};*/

//let body = [];

/*const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
        body.push(chunk);
    })


    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const responseResult = JSON.parse(Buffer.concat(body).toString());
                console.log(responseResult.free_spaces);
                return responseResult.free_spaces;
            } catch (error) {
                console.log('Error with parsing data:', error.message);
                return -1;
            }
        }
    });

    req.on('error', (e) => {
        console.error(e);
        return -1;
    });
});
req.end();*/

/*const options = {
    hostname: 'parkgard.msr-traffic.de',
    path: '/msrpocking/1/get?id=1-A-S008',
    method: 'GET',
    headers: {
        'Cookie': `session=3165112017802051293`,
    }
}

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
        process.stdout.write(d)
    })
})

req.on('error', error => {
    console.error(error)
})

req.end()*/

/*const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
        body.push(chunk);
    })

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const responseResult = JSON.parse(Buffer.concat(body).toString());
                console.log(responseResult)
                return responseResult.free_spaces;
            } catch (error) {
                console.log('Error with parsing data:', error.message);
                return -1;
            }
        }
    });

    req.on('error', (e) => {
        console.error(e);
        return -1;
    });
});

req.end();*/
/*function getData() {
    let body = [];
    const options = {
        hostname: 'parkgard.msr-traffic.de',
        path: `/msrpocking/1/get?id=1-F-S007`,
        method: 'GET',
        headers: {
            'Cookie': `session=3165112017802051293`,
        }
    };
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.on('data', (chunk) => {
                body.push(chunk);
                //console.log(chunk.toString())
            })

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const responseResult = JSON.parse(Buffer.concat(body).toString());
                        resolve(responseResult.free_spaces);
                    } catch (error) {
                        reject(error.message);
                    }
                }
            });

            req.on('error', (e) => {
                reject(e.message);
            });
        });
        req.end()
    });
}
*/


async function reserveParkingPlace() {
    const options = {
        host: 'parkgard.msr-traffic.de',
        path: `/msrpocking/1/release?id=1-F-S007`,
        method: 'POST',
        headers: {
            'Cookie': `session=3165112017802051293`,
        }
    };
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(true);
            }
            resolve(false);
        });

        req.end()
    })
}

reserveParkingPlace().then((data) => {
    console.log(data);
})