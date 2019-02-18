# things-viewer
Viewer application for data stored in _LoggerDaisy Things_ storage

### Device descriptor

LoggerDaisy Viewer requires data descriptor metafile, it helps to "understand" the data collected from sensors and stored within _LoggerDaisy Things_ storage.

Below is the example for LoggerDaisy HT2000 module that collects temperature, humidity and CO2 values.

```json
{
  "description": "LoggerDaisy HT2000/S8",
  "firmware": {
    "version": "loggerdaisy-ht2000-monitor, 1.0.1"
  },
  "sensors": [
    {
      "name": "temperature",
      "range": {
        "min": -10,
        "max": 70,
        "unit": "C"
      }
    },
    {
      "name": "humidity",
      "range": {
        "min": 0,
        "max": 100,
        "unit": "%"
      }
    },
    {
      "name": "co2",
      "range": {
        "min": 400,
        "max": 2000,
        "unit": "ppm"
      }
    }
  ]
}
```

Besides device _description_ and _firmware_ information, there is _sensors_ array that contains items with your sensing element descriptions:

- _name_ - name of the sensor,
- _range_ - sensor operating range with its _min_, _max_ values and measurement _unit_

> **NOTE**: Make sure you put sensor description items in very same order as you send them to LoggerDaisy Things API

### How to send data to LoggerDaisy Things

To minimize memory usage in your embedded devices and to simplify things LogerDaisy Things API accepts requests via GET method on the following end-point:

```
http://things.loggerdaisy.com/api/csv
```

API will expect requests including _X_Device-ID_ to be passed in HTTP headers. You will be able to query your device by id and view its data by opening an URL in the browser like _http://view.loggerdaisy.com/devices/{device-id}_, like this:

```
http://view.loggerdaisy.com/devices/ld-ht2000-01
```

Below is example of HTTP request implemented in node.js to send sensors data to LogerDaisy Things API:

```js
let result = {temperature: 25.50, humidity: 34.00, co2: 400};

log.info('Storing sensor readings on server...');
request({
    url: `http://things.loggerdaisy.com/api/csv?temperature=${result.temperature}&humidity=${result.humidity}&co2=${result.co2}`,
    headers: {'X-Device-ID': 'ld-ht2000-01'}
}).then(body =>
{
    try
    {
        const doc = JSON.parse(body);
        log.info(`\trecord id: ${doc.result.id}`);
    }
    catch (e)
    {
        log.error(e.message);
    }
});
```
