/**
 * LoggerDaisy Things Viewer
 * Created by skitsanos on 8/10/17.
 */
const manifest = require('./package');
const path = require('path');
global.appRoot = path.resolve(__dirname);

const logger = require('./app/utils/logger');
global.log = logger;

const express = require('express');
const bodyParser = require('body-parser');
global.app = express();

process.title = manifest.name;
global.app.locals.title = process.title;

global.config = {
    dataPath: global.appRoot + '/device-meta',
    metaPath: global.appRoot + '/device-meta'
};

/**
 * Support for Handlerbars Templating
 */
const exphbs = require('express-handlebars');
global.hbs = exphbs.create({
    extname: '.html',
    partialsDir: [
        'ui/content/'
    ]
});

const helpers = require('handlebars-helpers')(global.hbs);
/*
 * Setting templates engine Handlebars and pre-load fragments of content
 */

global.app.engine('html', hbs.engine);
global.app.set('views', __dirname + '/ui/');
global.app.set('view engine', 'html');

/**
 * Enable support for body parsing
 */
global.app.use(bodyParser.urlencoded({
    extended: true
}));
global.app.use(bodyParser.json());

/**
 * Sessions support
 */
const session = require('express-session');
global.app.use(session({secret: 'application-secret', resave: false, saveUninitialized: true}));

const flash = require('connect-flash');
global.app.use(flash());

const cookieParser = require('cookie-parser');
global.app.use(cookieParser());

global.app.use((err, req, res, next) =>
{
    global.log.error(err.message);
    next(err);
});

/**
 * Support for static resources
 */
global.app.use('/ui', express.static('ui/assets'));

global.log.info(`Booting ${manifest.name}...`);

const async = require('async');
async.parallel({
    schemas: function (callback)
    {
        let loader = require('./app/utils/schemas-loader');
        loader.load(function ()
        {
            callback(null, global.schemas);
        });
    },
    handlers: function (callback)
    {
        let loader = require('./app/utils/handlers-loader');
        loader.load(global.app).then(r =>
        {
            global.log.info('Handlers loaded');
            callback();
        }).catch(err =>
        {
            global.log.error(err.message);
        });
    }
}, (err, res) =>
{
    if (err)
    {
        global.log.error(err.message);
    }
    else
    {
        global.log.info('Starting web server');

        global.app.listen(process.env.PORT || process.env.VMC_APP_PORT || 3000, function ()
        {
            global.log.info(`${manifest.name} (${manifest.description}) is running. PID: ${process.pid}`);
        });
    }
});