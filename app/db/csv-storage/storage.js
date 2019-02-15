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

    /**
     * Returns version of the storage wrapper
     * @returns {string}
     */
    static version()
    {
        return 'CSV Storage Wrapper 1.0.0';
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
            if (data.deviceId === undefined)
            {
                return reject({message: 'Wrong data packet'});
            }
            else
            {
                let id = this.getUuid();

                let path = process.cwd() + '/data/' + data.deviceId + '.csv';

                let values = [id, this.getTimestampString()];

                delete (data.deviceId);

                for (let key in data)
                {
                    values.push(data[key]);
                }

                fs.appendFile(path, values.join(',') + '\n', (err) =>
                {
                    if (err)
                    {
                        storage.loge(err);
                        return reject(err);
                    }

                    return resolve({id: id});
                });
            }

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
            //CSV storage is append only in this version, so we don't perform update
            //todo: implement update
            resolve();
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