const manifest = require('../../package');
const RequestHandler = require('./_request-handler');

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
            res.send({result: 'ok', version: manifest.version, info: manifest.name + ' (' + manifest.description + ')'});
        }).catch(err =>
        {
            res.send({error: 'Failed to process request', reason: err});
        });
    }
}

module.exports = new handler().handle;