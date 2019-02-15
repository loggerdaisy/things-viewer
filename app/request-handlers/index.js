/**
 * Index page handler
 * Created by skitsanos on 2019-02-13.
 */
let RequestHandler = require('./_request-handler');
let manifest = require('../../package');

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

            global.hbs.getPartials().then(function (partials)
            {
                res.render('index', {
                    session: req.session,
                    layout: false,
                    base_path: '<base href="/ui/">',
                    content: ''
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

        }).catch(err =>
        {
            res.send({error: 'Failed to process request', reason: err});
        });
    }
}

module.exports = new handler().handle;