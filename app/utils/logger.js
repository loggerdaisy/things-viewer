/**
 * Application Logging Functionality
 */

const fs = require('fs');
const winston = require('winston');
const Transport = require('winston-transport');
const moment = require('moment');

class FileTransport extends Transport
{
    constructor(opts)
    {
        super(opts);
    }

    log(info, callback)
    {
        fs.appendFile(process.cwd() + '/app.log', `${moment().format('YYYY-MM-DD hh:mm:ss.SSSS')} ${info.message}\n`, (err) =>
        {
            if (err)
            {
                console.log(err.message);
            }
        });
        callback();
    }
}

const loggingFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.printf(info =>
    {
        return ` ${moment().format('YYYY-MM-DD hh:mm:ss.SSSS')} ${info.level}: ${info.message}`;
    }));

const logger = winston.createLogger({
    exitOnError: false,
    transports: [
        new FileTransport(
            {
                format: loggingFormat,
                timestamp: true
            }
        ),
        new winston.transports.Console({
            format: loggingFormat
        })
    ]
});

module.exports = logger;