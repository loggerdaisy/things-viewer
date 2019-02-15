/**
 * Index page handler
 * Created by skitsanos on 2019-02-13.
 */
const RequestHandler = require('./_request-handler');
const manifest = require('../../package');
const fs = require('fs');
const path = require('path');

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
            //res.send({result: 'ok', version: manifest.version, info: manifest.name + ' (' + manifest.description + ')'});

            let devices = [];
            fs.readdir(global.config.metaPath, (err, items) =>
            {
                let targetFiles = items.filter(file =>
                {
                    return path.extname(file).toLowerCase() === '.json';
                });

                for (let i = 0; i < targetFiles.length; i++)
                {
                    let doc = fs.readFileSync(global.config.metaPath + '/' + targetFiles[i], 'utf8').toString();
                    try
                    {
                        let device = JSON.parse(doc);
                        device.id = path.basename(targetFiles[i], '.json');
                        devices.push(device);
                    }
                    catch (e)
                    {
                        global.log.error(`Error parsing ${targetFiles[i]}`);
                    }
                }

                global.hbs.getPartials().then(function (partials)
                {
                    res.render('devices', {
                        session: req.session,
                        layout: false,
                        base_path: '<base href="/ui/">',
                        title: 'Devices',
                        devices: devices
                    }, (render_error, html) =>
                    {
                        if (render_error)
                        {
                            res.send(`Ups... ${manifest.name} can't find index page`);
                        }
                        else
                        {
                            res.send(html);
                        }
                    });
                });
            });

        }).catch(err =>
        {
            res.send({error: 'Failed to process request', reason: err});
        });
    }
}

module.exports = new handler().handle;