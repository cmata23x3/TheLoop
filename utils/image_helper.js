// PRIMARY AUTHOR: Calvin Li

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var Event = require('../models/event');
var Group = require ('../models/group');
var Errors = require('../errors/errors');

/*------------------ Image Helper Functions ------------------*/

/**
 * Returns the folder path for event image
 *
 * @param type - either 'groups' or 'events'
 * @param id - username for event/group-specific folder
 */
var getUploadFolderPath = function(type, id) {
    var folderPath = __dirname + '/../public/uploads/';
    folderPath += type + '/' + id;

    return path.resolve(folderPath);
}

/**
 * Create the file name of uploaded image for uniqueness
 *
 * @param fileName - name of uploaded file
 * @param mimetype - file type (jpeg or png)
 */
var getFileName = function(fileName, mimetype) {
    //remove spaces and .png/.jpg, shrink name <=10 chars, lowercase
    fileName = fileName.replace(/(\s+)|(\.png)|(\.jpg)/g, '')
                           .slice(0, 10).toLowerCase();
    fileName += Date.now();

    var fileType = (mimetype === 'image/png') ? '.png' : '.jpg';

    return fileName + fileType;
}

/**
 * Builds the directory for a folder path if necessary
 *
 * @param {String} folderPath - directory path to build
 * @param {Function} callback - callback called after creating directory
 */
var buildDirectory = function(folderPath, callback) {
    fs.exists(folderPath, function(exists) {
        if (exists) {
            callback();
        } else {
            //make dir because it doesn't exist
            mkdirp(folderPath, callback);
        }
    });
}

/**
 * Create the image url based off parameters for group/event image
 *
 * @param type - enum of 'groups' or 'events'
 * @param id - group/event id, depending on type
 * @param fileName - name of file for image url
 */
module.exports.createImageURL = function(type, id, fileName) {
    return '/uploads/' + type + '/' + id + '/' + fileName;
}

/**
 * Upload image to directory
 *
 * @param req - express req object
 * @param type - enum, 'groups' or 'events'
 * @param id - id of group or event
 * @param callback - callback called after uploading image, with parameters
 *              1) API Error Response
 *              2) fileName of uploaded image
 */
module.exports.uploadImage = function(req, type, id, callback) {
    //Upload image
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        //Check if is png or jpeg
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return callback(Errors.images.invalidType);
        }

        //Get file upload directory and build if not made yet
        var uploadFolder = getUploadFolderPath(type, id);
        buildDirectory(uploadFolder, function(err) {
            if (err) {
                console.log('Build Directory Fail: ', err);

                var err = Errors.images.buildDirectory;
                return callback(err);
            }

            //get file name
            var fileName = getFileName(filename, mimetype);
            
            //Upload file to directory
            var filePath = path.resolve(uploadFolder + '/' + fileName);
            fstream = fs.createWriteStream(filePath);
            file.pipe(fstream);
            fstream.on('close', function() {
                callback(undefined, fileName);
            });
        });
    });
};

/**
 * Delete image from directory
 *
 * @param type - enum, 'groups' or 'events'
 * @param id - id of group or event
 * @param filename - file name
 * @param callback - callback called after uploading image, with parameters
 *              1) API Error Response
 *              2) fileName of uploaded image
 */
module.exports.deleteImage = function(type, id, fileName, callback) {
    var fileDirectory = path.resolve(getUploadFolderPath(type, id) + '/' + fileName);
    fs.unlink(fileDirectory, callback);
};