const { attributes } = require('structure');

const DeviceProperty = attributes({
    name: {
        type: String,
        default: ''
    },
    value: {
        type: String
    }
})(class DeviceProperty {
    toString()
    {
        return JSON.stringify(this);
    }
});

module.exports = DeviceProperty;