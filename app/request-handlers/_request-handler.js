class RequestHandler
{
    constructor()
    {
    }

    static version()
    {
        return '1.0.20181211';
    }

    render(res, template, options)
    {
        global.hbs.getPartials().then(function (partials)
        {
            res.render(template, options, (render_error, html) =>
            {
                if (render_error)
                {
                    res.send(`Ups... can't find template page ${template}`);
                }
                else
                {
                    res.send(html);
                }
            });
        });
    }

    handle(req, res)
    {
        return new Promise((resolve, reject) =>
        {
            //console.log('got super');
            resolve(true);
        });
    }
}

module.exports = RequestHandler;