/**
 * Index page handler
 * Created by skitsanos on 2019-02-13.
 */
const RequestHandler = require('./_request-handler');
const manifest = require('../../package');
const fs = require('fs');
const parse = require('csv-parse');

class handler extends RequestHandler
{
    constructor()
    {
        super();
    }

    handle(req, res)
    {
        super.handle(req, res).then(result =>
        {
            let dataFilePath = global.config.dataPath + '/' + req.params.deviceId + '.csv';
            let metaFilePath = global.config.metaPath + '/' + req.params.deviceId + '.json';

            if (fs.existsSync(dataFilePath) && fs.existsSync(metaFilePath))
            {
                let dataDoc = fs.readFileSync(dataFilePath, 'utf8').toString();
                let metaDoc = JSON.parse(fs.readFileSync(metaFilePath, 'utf8').toString());

                parse(dataDoc, {
                    delimiter: ',',
                    comment: '#',
                    skip_empty_lines: true
                }, (err, output) =>
                {
                    if (err)
                    {
                        super.render(res, 'error', {
                            session: req.session,
                            layout: false,
                            base_path: '<base href="/ui/">',
                            title: err.message,
                            content: err
                        });
                    }
                    else
                    {
                        let data = {};
                        let sensorNames = [];
                        let sensorRanges = {};

                        for (let m = 0; m < metaDoc.sensors.length; m++)
                        {
                            let meta = metaDoc.sensors[m];
                            sensorNames.push(meta.name);
                            sensorRanges[meta.name] = meta.range;

                            /*data.push({
                             name: meta.name,
                             items: output.map(r =>
                             {
                             return {
                             date: r[1],
                             value: Number(r[m + 2]),
                             l: Number(meta.range.min),
                             u: Number(meta.range.max)
                             };
                             })
                             });*/

                            data[meta.name] = output.map(r =>
                            {
                                return {
                                    date: r[1],
                                    value: Number(r[m + 2]),
                                    l: Number(meta.range.min),
                                    u: Number(meta.range.max)
                                };
                            });
                        }

                        super.render(res, 'device-by-id', {
                            session: req.session,
                            layout: false,
                            base_path: '<base href="/ui/">',
                            title: req.params.deviceId,
                            sensors: sensorNames,
                            sensorRanges: sensorRanges,
                            data: data
                        });

                    }
                });
            }
            else
            {
                super.render(res, 'error', {
                    session: req.session,
                    layout: false,
                    base_path: '<base href="/ui/">',
                    title: 'Not found',
                    content: `${req.params.deviceId} data can't be displayed`
                });
            }

        }).catch(err =>
        {
            res.send({error: 'Failed to process request', reason: err});
        });
    }
}

module.exports = new handler().handle;