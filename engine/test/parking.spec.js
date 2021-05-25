const assert = require('assert');

describe('[thing-it] Msr smartengine Plugin', function () {
    let testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({
            logLevel: "debug",
            simulated: false
        });

        testDriver.registerDevicePlugin('msr', __dirname + '/../smartengine.js');
        testDriver.registerUnitPlugin(__dirname + "/../default-units/parking.js");
    });

    describe('Start Configuration', function () {

        it('should complete without error', function () {
            return testDriver.start({
                configuration: require("../examples/configuration.js"),
                heartbeat: 10,
            });
        });
    });

    describe('Start testing', function () {

        it('should set count of free places correctly', function (done) {
            console.log('Start...');
            console.log(testDriver.devices[0].actors[0]);
            const parking = testDriver.devices[0].actors[0];
            parking.getData();

            setTimeout(() => {
                assert.equal(parking.state.countOfFreePlaces, 1);
                done()
            }, 3000);

        }).timeout(7000);

        it('should reserve place', function (done) {
            console.log('Start...');
            const parking = testDriver.devices[0].actors[0];
            parking.reserve();

            setTimeout(() => {
                assert.equal(parking.state.isReserved, true);
                assert.equal(parking.state.countOfFreePlaces, 0);
                done()
            }, 3000);

        }).timeout(7000);

        it('should release place', function (done) {
            console.log('Start...');
            const parking = testDriver.devices[0].actors[0];
            console.log(testDriver)
            parking.release();

            setTimeout(() => {
                assert.equal(parking.state.isReserved, false);
                done()
            }, 3000);

        }).timeout(7000);
    });

    after(() => {
        testDriver.stop();
      });
});