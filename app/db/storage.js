const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
bluebird.promisifyAll(redis.createClient.prototype);

const uuidv1 = require('uuid/v1');
const MS_PER_MINUTE = 60000;
const MIN_PER_HOUR = 60;
const HOUR_PER_DAY = 24;
const Q_HOUR = 15;
const HALF_HOUR = 30; //half an hour in minutes
module.exports = {

    devices: {
        namespace: function ()
        {
            return namespace;
        },
        save: function (data)
        {

            const client = redis.createClient();
            data.token = uuidv1();
            data.createdOn = new Date().getTime();

            return new Promise((resolve, reject) =>
            {
                client.hgetAsync(`Things:Devices:${data.uid}`, 'token').then(function (r)
                {
                    if (r != null)
                    {

                        reject('The device already exists.');
                        client.quit();
                        return;
                    }

                    let multi = client.multi();
                    for (let key in data)
                    {

                        if (key === 'properties')
                        {
                            let propertyOb = {};
                            data[key].forEach(function (el)
                            {
                                propertyOb[el.name] = el.value;
                            });
                            multi.hset(`Things:Devices:${data.uid}`, key, JSON.stringify(propertyOb));
                        } else
                        {

                            multi.hset(`Things:Devices:${data.uid}`, key, data[key]);
                        }

                    }

                    multi.set(`Things:Tokens:${data.token}`, data.uid);
                    multi.execAsync().then(function (r)
                    {
                        console.log(r);
                        resolve(data);
                        client.quit();
                    }).catch(function (e)
                    {
                        console.error(e);
                        client.quit();
                    });

                }).catch(function (e)
                {
                    reject(e);
                    client.quit();
                });

            });
        },
        get: function (token)
        {
            const client = redis.createClient();
            return new Promise((resolve, reject) =>
            {

                client.getAsync(`Things:Tokens:${token}`).then(function (r)
                {
                    return client.hgetallAsync(`Things:Devices:${r}`);
                }).then(function (r)
                {
                    if (r != null)
                    {
                        let properties = [];
                        let jo = JSON.parse(r.properties);
                        for (let key in jo)
                        {
                            properties.push({
                                name: key,
                                value: jo[key]
                            });
                        }

                        r.properties = properties;
                    }
                    resolve(r);
                }).catch(function (e)
                {
                    reject(e);
                });
            });
        },
        update: function (data)
        {

            const client = redis.createClient();
            data.token = uuidv1();
            data.createdAt = new Date().getTime();
            client.getAsync(`Things:Tokens:${token}`).then(function (r)
            {
            }).catch(function (e)
            {
                // reject(e);
            });
        },
        delete: function (token)
        {
            const client = redis.createClient();
            return new Promise((resolve, reject) =>
            {
                let uid;
                client.getAsync(`Things:Tokens:${token}`).then(function (r)
                {
                    uid = r;
                    return client.hgetallAsync(`Things:Devices:${r}`);
                }).then(function (r)
                {
                    let multi = client.multi();
                    for (let key in r)
                    {
                        multi.hdel(`Things:Devices:${uid}`, key);
                    }

                    multi.del(`Things:Tokens:${token}`);

                    multi.execAsync().then(function (r)
                    {
                        resolve(r);
                    }).catch(function (e)
                    {
                        reject(e);
                    });

                }).catch(function (e)
                {
                    reject(e);
                });
            });
        }
    },
    ping: {
        save: function (doc)
        {
            const client = redis.createClient();

            return new Promise((resolve, reject) =>
            {
                client.getAsync(`Things:Tokens:${doc.token}`).then(function (r)
                {
                    if (r == null)
                    {
                        reject('The device could not be found.');
                        client.quit();
                        return;
                    }
                    let score = new Date().getTime();
                    let data = {
                        timestamp: score,
                        data: doc.data
                    };

                    // if()

                    client.zaddAsync([`Things:Pings:${doc.token}`, score, JSON.stringify(data)]).then(function (r)
                    {
                        resolve(doc);
                        client.quit();
                    }).catch(function (e)
                    {
                        client.quit();
                    });

                }).catch(function (e)
                {
                    reject(e);
                    client.quit();
                });

            });
        },
        saveComplex: function (doc)
        {
            const client = redis.createClient();

            return new Promise((resolve, reject) =>
            {
                client.getAsync(`Things:Tokens:${doc.token}`).then(function (r)
                {
                    if (r == null)
                    {
                        reject('The device could not be found.');
                        client.quit();
                        return;
                    }
                    let score = new Date().getTime();
                    let data = {
                        timestamp: score,
                        data: doc.data
                    };

                    let multi = client.multi();
                    multi.zadd([`Things:Pings:${doc.token}`, score, JSON.stringify(data)]);

                    let d = new Date(score);
                    d.setDate(d.getDate() - 1);
                    let initialScore = d.getTime();

                    if (d.getMinutes() % Q_HOUR === 0)
                        multi.zrangebyscore([`Things:Pings:${doc.token}`, initialScore, score]);

                    multi.execAsync().then(function (results)
                    {
                        if (results.length > 1 && results[1].length > 0)
                        {
                            d.setDate(d.getDate() + 1);
                            d.setSeconds(0, 0);

                            //convert to json array
                            let joArr = [];
                            results[1].forEach(function (json)
                            {
                                joArr.push((JSON.parse(json)));
                            });


                            let m = client.multi();
                            let _score  = d.getTime();

                            let qReport = computeReport(joArr.filter(x => x.timestamp > _score - Q_HOUR * MS_PER_MINUTE));
                            qReport.timestamp = _score;
                            m.zadd([`Things:Reports:${doc.token}:15m`, qReport.timestamp, JSON.stringify(qReport)]);

                            if (d.getMinutes() === 0 && d.getHours() === 0)
                            {
                                let report = computeReport(joArr);
                                report.timestamp = _score;
                                m.zadd([`Things:Reports:${doc.token}:1d`, report.timestamp, JSON.stringify(report)]);
                            }

                            if (d.getHours() % 3 === 0 && d.getMinutes() === 0)
                            {
                                //compute 3h + filter array
                                let report = computeReport(joArr.filter(x => x.timestamp > _score - 3 * MIN_PER_HOUR * MS_PER_MINUTE));
                                report.timestamp = _score - 3 * MIN_PER_HOUR * MS_PER_MINUTE; //change this
                                m.zadd([`Things:Reports:${doc.token}:3h`, report.timestamp, JSON.stringify(report)]);
                            }

                            if (d.getHours() % 6 === 0 && d.getMinutes() === 0)
                            {
                                //compute 6 hours
                                let report = computeReport(joArr.filter(x => x.timestamp > _score - 6 * MIN_PER_HOUR * MS_PER_MINUTE));
                                report.timestamp = _score;
                                m.zadd([`Things:Reports:${doc.token}:6h`, report.timestamp, JSON.stringify(report)]);
                            }
                            if (d.getHours() % 12 === 0 && d.getMinutes() === 0)
                            {
                                //compute 12 hours
                                let report = computeReport(joArr.filter(x => x.timestamp > _score - 12 * MIN_PER_HOUR * MS_PER_MINUTE));
                                report.timestamp =_score;
                                m.zadd([`Things:Reports:${doc.token}:12h`, report.timestamp, JSON.stringify(report)]);
                            }
                            if (d.getMinutes() === 0)
                            {
                                //compute hourly
                                let report = computeReport(joArr.filter(x => x.timestamp > _score - MIN_PER_HOUR * MS_PER_MINUTE));
                                report.timestamp =_score;
                                m.zadd([`Things:Reports:${doc.token}:1h`, report.timestamp, JSON.stringify(report)]);
                            }
                            if (d.getMinutes() % HALF_HOUR === 0)
                            {
                                //compute half an hour
                                let report = computeReport(joArr.filter(x => x.timestamp > _score - HALF_HOUR * MS_PER_MINUTE));
                                report.timestamp = _score;
                                m.zadd([`Things:Reports:${doc.token}:30m`, report.timestamp, JSON.stringify(report)]);
                            }

                            m.exec(function (err, replies)
                            {

                                client.quit();
                            });
                        } else
                        {
                            client.quit();
                        }

                        resolve(doc);

                    }).catch(function (e)
                    {
                        reject(e);
                        client.quit();
                    });


                }).catch(function (e)
                {
                    reject(e);
                    client.quit();
                });

            });
        },
        search: function (filter)
        {
            const client = redis.createClient();

            return new Promise((resolve, reject) =>
            {
                client.getAsync(`Things:Tokens:${filter.token}`).then(function (r)
                {
                    if (r == null)
                    {
                        reject('The device could not be found.');
                        client.quit();
                        return;
                    }

                    let args = [`Things:Pings:${filter.token}`, '+inf', '-inf'];

                    client.zrevrangebyscoreAsync(args).then(function (r)
                    {
                        let result = [];

                        r.forEach(function (el)
                        {
                            result.push(JSON.parse(el));
                        });
                        resolve(result);
                        client.quit();
                    }).catch(function (e)
                    {
                        console.error(e);
                        client.quit();
                    });

                }).catch(function (e)
                {
                    console.error(e);
                    reject(e);
                    client.quit();
                });
            });
        }
    },
    reports: {}

};


function computeReport(arr)
{
    let report = {
        timestamp: 0,
        data: {},
        items: 0
    };
    for (let kv in arr[0].data)
    {
        report.data[kv] = {
            min: arr[0].data[kv],
            max: arr[0].data[kv],
            avg: 0
        };
    }
    //or(let kv in)
    arr.forEach(function (el, index)
    {
        report.items++;
        for (let kv in el.data)
        {
            report.data[kv].min = report.data[kv].min > el.data[kv] ? el.data[kv] : report.data[kv].min;
            report.data[kv].min = report.data[kv].max < el.data[kv] ? el.data[kv] : report.data[kv].max;
            report.data[kv].avg += el.data[kv];

            if (index === arr.length - 1)
                report.data[kv].avg = report.data[kv].avg / arr.length;
        }
    });

    return report;
}