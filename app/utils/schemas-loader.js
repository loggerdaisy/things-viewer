/**
 * Express JS data models/types loader
 * Created by skitsanos on 5/25/17.
 */

const fs = require('fs');
const path = require('path');

module.exports = {
    path: global.appRoot + '/app/schemas/',

    load: function (callback)
    {
        if (global.schemas === undefined) {
            global.schemas = {};
        }

        let _path = this.path;
        fs.readdir(this.path, function (err, items)
        {
            if (items !== undefined) {
                for (let i = 0; i < items.length; i++) {
                    if (path.extname(items[i]).toLowerCase() === '.js') {
                        let filename = path.basename(items[i], '.js');
                        global.schemas[filename] = require(_path + filename);
                    }
                }

                global.log.info(`${items.length} schemas loaded from ${_path}`);

                callback();
            }
        });
    }
};