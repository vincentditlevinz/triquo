/*
  Encapsulate useful function for processing images in the context of TriqoLoto
 */

const Jimp = require('jimp');
const p = require('../util/parameterization');
const log4js = require('log4js');
const logger = log4js.getLogger('images');
logger.level = 'warn';
const cached = require('cached');
const cache = cached('images', { backend: {
    type: 'memory'
}});

/*
  Insert the image in the matrix at the given row and column.
  The image is automatically resized according to the matrix size, the border and the padding thickness
 */
function insertImage(img, matrix, col, row) {
    iWidth = (matrix.getWidth() - 2 * p.Border) / p.NCols - 2 * p.Padding;
    iHeight = (matrix.getHeight() - 2 * p.Border) / p.NRows - 2 * p.Padding;

    img.resize(iWidth, iHeight, Jimp.RESIZE_HERMITE);
    matrix.blit(img, col * (iWidth + 2 * p.Padding) + p.Border  + p.Padding, row * (iHeight + 2 * p.Padding) + p.Border + p.Padding)
}

/*
  Load and image or return undefined in case of an exception
 */
async function loadImageIfAny(path) {
    return await cache.getOrElse(path, async () => {
        try {
            return await Jimp.read(path);
        } catch (e) {
            logger.warn("No pub image with path " + path)
        }
        return null;
    });
}

exports.insertImage = insertImage;
exports.loadImageIfAny = loadImageIfAny;
