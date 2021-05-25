module.exports = {
    "label": "Parking System",
    "id": "parkingSystem",
    "devices": [{
        "plugin": "msr/smartengine",
        "actors": [{
            id: "parking-01",
            label: "Parking",
            type: "parking",
            logLevel: 'debug',
            "configuration": {
                "parkingId": '1-F-S007'
            }
        }],
        "sensors": [],
        "services": [],
        "class": "Device",
        "keywords": [],
        "id": "smartengine-01",
        "label": "Smartengine 1",
        "configuration": {
            "username": "PGCC",
            "password": "PGCC",
            "projectId": '1',
        }
    }],
    "groups": [],
    "services": [],
    "eventProcessors": [],
    "data": [],
};
