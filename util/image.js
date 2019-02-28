/*
  Encapsulate useful function for processing images in the context of TriqoLoto
 */

const Jimp = require('jimp');
const p = require('./parameterization');
const log4js = require('log4js');
const logger = log4js.getLogger('images');
const cached = require('cached');
const cache = cached('images', { backend: {
    type: 'memory'
}});


logger.level = 'info';

/*
  Insert the image in the matrix at the given row and column.
  The image is automatically resized according to the matrix size, the border and the padding thickness
 */
async function insertImage(imagePath, matrix, col, row) {
    const iWidth = getImageWidth(matrix);
    const iHeight = getImageHeight(matrix);

    const step0 = Date.now();
    const img = await loadImageIfAny(imagePath, iWidth, iHeight);
    const step1 = Date.now();
    if (logger.isDebugEnabled())
        logger.debug("Image loaded and resized in " + (step1 - step0) + " milli seconds.");

    if (img != null) {
        const step2 = Date.now();
        matrix.blit(img, col * (iWidth + 2 * p.Padding) + p.BorderXpc * matrix.getWidth() + p.Padding, row * (iHeight + 2 * p.Padding) + p.BorderYpc * matrix.getHeight() + p.Padding);
        const step3 = Date.now();
        if (logger.isDebugEnabled())
            logger.debug("Image superimposed in " + (step3 - step2) + " milli seconds.");
    }
}

function getImageWidth(matrix) {
    return (matrix.getWidth() - 2 * p.BorderXpc * matrix.getWidth()) / p.NCols - 2 * p.Padding;
}

function getImageHeight(matrix) {
    return (matrix.getHeight() - 2 * p.BorderYpc * matrix.getHeight()) / p.NRows - 2 * p.Padding;
}

/*
  Load and image or return undefined in case of an exception
 */
async function loadImageIfAny(path, width, height) {
    return await cache.getOrElse(path, async () => {
        try {
            const img = await Jimp.read(path);
            if(width != null && height != null) {
                if(logger.isDebugEnabled())
                    logger.debug(path + "   width=" + width + "     height=" + height);
                img.resize(width, height, Jimp.RESIZE_HERMITE);
            }
            return img;
        } catch (e) {
            logger.warn("No pub image with path " + path)
        }
        return null;
    });
}

exports.insertImage = insertImage;
exports.loadImageIfAny = loadImageIfAny;
exports.getImageWidth = getImageWidth;
exports.getImageHeight = getImageHeight;
