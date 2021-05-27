const assert = require('assert');

describe('[thing-it] Msr smartengine Plugin', function () {
    let testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({
            logLevel: "debug",
            simulated: false
        });

        testDriver.registerDevicePlugin('msr', __dirname + '/../smartengine');
        testDriver.registerUnitPlugin(__dirname + "/../default-units/parking");
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
            const parking = testDriver.devices[0].actors[0];
            parking.getData();

            setTimeout(() => {
                if (parking.state.countOfFreePlaces) {
                    assert.equal(parking.state.countOfFreePlaces, 1);
                    done()
                } else {
                    assert.equal(parking.state.countOfFreePlaces, 0);
                    done()
                }
            }, 3000);

        }).timeout(5000);

        it('should reserve place', function (done) {
            console.log('Start...');

            const parking = testDriver.devices[0].actors[0];
            if (parking.state.countOfFreePlaces > 0) {
                parking.reserve();

                setTimeout(() => {
                    assert.equal(parking.state.isReserved, true);
                    assert.equal(parking.state.countOfFreePlaces, 0);
                    done()
                }, 5000);
            } else {
                assert.equal(assert.equal(parking.state.isReserved, false));
                done()
            }

        }).timeout(7000);

        it('should release place', function (done) {
            console.log('Start...');
            const parking = testDriver.devices[0].actors[0];
            if (parking.state.isReserved) {
                parking.release();
                setTimeout(() => {
                    assert.equal(parking.state.isReserved, false);
                    done()
                }, 3000);
            } else {
                assert.equal(parking.state.isReserved, false);
                done();
            }

        }).timeout(7000);
    });

    after(() => {
        testDriver.stop();
    });
});