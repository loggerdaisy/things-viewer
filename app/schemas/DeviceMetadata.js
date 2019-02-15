const { attributes } = require('structure');
const DeviceProperty = require('./DeviceProperty');

const DeviceMetadata = attributes({
    name: {
        type: String,
        default: ''
    },
    properties: {
        type: Array,
        itemType: DeviceProperty,
        empty: false
    },

    uid:{
        type:String,
        required:true,
        empty:false
    }

})(class DeviceMetadata {
    toString()
    {
        return JSON.stringify(this);
    }
});

module.exports = DeviceMetadata;