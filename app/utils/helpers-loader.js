/**
 * Handlebars content rendering helpers loader
 * Created by skitsanos on 5/25/17.
 */

const fs = require('fs');
const path = require('path');

module.exports = {
    path: global.appRoot + '/app/content-helpers/',

    list: () =>
    {
        fs.readdir(this.path, function (err, items)
        {
            if (items !== undefined)
            {
                for (let i = 0; i < items.length; i++)
                {
                    if (path.extname(items[i]).toLowerCase() === '.js')
                    {
                        let filename = path.basename(items[i], '.js');
                        console.log(filename);
                    }
                }
            }
        });
    },

    load: (container, callback) =>
    {
        let _path = this.path;

        fs.readdir(this.path, function (err, items)
        {
            if (items !== undefined)
            {
                for (let i = 0; i < items.length; i++)
                {
                    if (path.extname(items[i]).toLowerCase() === '.js')
                    {
                        let filename = path.basename(items[i], '.js');
                        container[filename] = require(_path + filename);
                    }
                }

                callback();
            }
        });
    }
};