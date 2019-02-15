/**
 * Express JS handlers loader
 * @author skitsanos
 * @version 2.20181211.02
 */

const fs = require('fs');
const handlers = require('../request-handlers/map').handlers;

module.exports = {
    path: global.appRoot + '/app/request-handlers/',

    load: function (container)
    {
        let _root = this.path;

        return new Promise((resolve, reject) =>
        {
            if (!fs.existsSync(_root))
            {
                return reject({message: _root + ' not found'});
            }

            for (let h = 0; h < handlers.length; h++)
            {
                let endpoint = handlers[h];
                if (endpoint.method === undefined)
                    endpoint.method = 'get';

                if (endpoint.handler === undefined)
                {
                    global.log.error(`Handler is not defined for ${endpoint.path} (${endpoint.method })`);
                }
                else
                {
                    let jsFile = _root + endpoint.handler;

                    if (fs.existsSync(jsFile + '.js'))
                    {
                        global.log.info(`loading handler for ${endpoint.path} ${endpoint.method !== undefined ? '(' + endpoint.method.toUpperCase() + ')' : ''}`);

                        switch (endpoint.method.toLowerCase())
                        {
                            case 'get':
                                container.get(endpoint.path, require(jsFile));
                                break;

                            case 'put':
                                container.put(endpoint.path, require(jsFile));
                                break;

                            case 'post':
                                container.post(endpoint.path, require(jsFile));
                                break;

                            case 'delete':
                                container.delete(endpoint.path, require(jsFile));
                                break;
                        }
                    }
                    else
                    {
                        global.log.error(`Handler not loaded for ${endpoint.path} ${endpoint.method !== undefined ? '(' + endpoint.method.toUpperCase() + ')' : ''}`);
                    }
                }
            }

            resolve(true);
        });
    }
};