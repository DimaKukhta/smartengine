const https = require('https');

const options = {
    host: 'parkgard.msr-traffic.de',
    path: '/syslogin',
    method: 'POST'
};


const req = https.request(options, (res) => {
    //console.log(res.headers['set-cookie'][0].split(';')[0]);
    console.log(res.statusCode)
    res.on('data', (data) => {
        console.log(data.toString())
    })
});
req.on('error', (error) => {
    console.log(error.message)
})

req.end();