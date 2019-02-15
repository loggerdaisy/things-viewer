/*
 * FileSystem Storage
 * @author: skitsanos
 * @version: 1.0.1
*/

const fs = require('fs');
const findInFiles = require('find-in-files');
const moment = require('moment');

const DataStorage = require('../data-storage-generic');

class storage extends DataStorage
{
    constructor(config)
    {
        super(config);

        let path = process.cwd() + '/data/';
        if (!fs.existsSync(path))
        {
            fs.mkdir(path, err =>
            {
                if (err)
                {
                    storage.loge(err);
                }
            });
        }
    }

    static getTimeStamp()
    {
        return moment().format('YYYYMMDDHHmmss-SSSS');
    }

    /**
     * Returns version of the storage wrapper
     * @returns {string}
     */
    static version()
    {
        return 'FileSystem Storage Wrapper 1.0.0';
    }

    /**
     * Creates new file to hold the data in it
     * @param data
     * @returns {Promise<any>}
     */
    put(data)
    {
        return new Promise((resolve, reject) =>
        {
            let path = process.cwd() + '/data/' + this.getUuid() + '.txt';
            fs.writeFile(path, data, (err) =>
            {
                if (err)
                {
                    storage.loge(err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * Updates file content
     * @param id
     * @param data
     * @returns {Promise<any>}
     */
    update(id, data)
    {
        return new Promise((resolve, reject) =>
        {
            let path = process.cwd() + '/data/' + id + '.txt';
            fs.writeFile(path, data, (err) =>
            {
                if (err)
                {
                    storage.loge(err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * Removes file from storage folder
     * @param id
     * @returns {Promise<any>}
     */
    delete(id)
    {
        return new Promise((resolve, reject) =>
        {
            let path = process.cwd() + '/data/' + id + '.txt';

            if (fs.existsSync(path))
            {
                fs.unlink(path, (err) =>
                {
                    if (err)
                    {
                        storage.loge(err);
                        return reject(err);
                    }
                    resolve();
                });
            }
            else
            {
                return reject({message: 'Path not found'});
            }
        });
    }

    /**
     * Search for the data within File Storage
     * @param query described on https://github.com/kaesetoast/find-in-files
     * @returns {Promise<any>}
     */
    search(query)
    {
        return new Promise((resolve, reject) =>
        {
            let path = process.cwd() + '/data/';

            findInFiles.find(query, path, '.txt$')
                .then(function (results)
                {
                    resolve(results);
                }).catch(err =>
            {
                return reject(err);
            });
        });
    }
}

module.exports = storage;