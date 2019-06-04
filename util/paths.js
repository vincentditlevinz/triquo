const fs = require('fs');
const path = require("path");
const log4js = require('log4js');
const logger = log4js.getLogger('paths');
logger.level = 'info';
const imagePaths = new Map();


/*
    If we are in dev process, default image is always used.
    Otherwise, a directory 'img' in the execution directory is scanned. If an image corresponding to the given number is found, it is used
    instead of the default one. As it is a try/catch test, one should us a caching mechanism to avoid repeating this operation too much.
 */
function resolveImgPath(number) {
    const defaultPath = path.join(__dirname, "..", 'img' , number + '.jpg');
    if(process.cwd() === path.join(__dirname, "..")) {// If path for overridden images is the same as default (developer use case)
        if(logger.isDebugEnabled())
            logger.debug("Default image is used (path: " + defaultPath + ").");
        return defaultPath;
    } else {
        const overriddenPath = path.join(process.cwd(), 'img', number + '.jpg');
        try {// If a given image is in the execution dir use it
            fs.accessSync(overriddenPath, fs.constants.F_OK);
            logger.info("Image with path: " + overriddenPath + " is used instead of default one.");
            return overriddenPath;
        } catch (e) {// use default embedded image otherwise
            if(logger.isDebugEnabled())
                logger.debug("Default image is used (path: " + defaultPath + ").");
            return defaultPath;
        }
    }
}

function getImgPath(number) {// A little bit of simple caching for improving performances
    if(!imagePaths.has(number)) {
        imagePaths.set(number, resolveImgPath(number));
    }
    return imagePaths.get(number);
}

function getPubPath(number) {
    return path.join(process.cwd(), 'pub', number + '.jpg');
}


function getOutputPath() {
    return path.join(process.cwd(), 'output.pdf');
}

function getMatrixPath() {
    return path.join(__dirname, "..", 'matrix', 'matrix.jpg');
}

function getLogoPath() {
    return path.join(__dirname, "..", 'matrix', 'logo.jpg');
}


exports.getMatrixPath = getMatrixPath;
exports.getLogoPath = getLogoPath;
exports.getImgPath = getImgPath;
exports.getPubPath = getPubPath;
exports.getOutputPath = getOutputPath;