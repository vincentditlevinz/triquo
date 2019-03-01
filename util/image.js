/*
  Encapsulate useful function for processing images in the context of TriqoLoto
 */

const Jimp = require('jimp');
const p = require('./parameterization');
const log4js = require('log4js');
const logger = log4js.getLogger('images');
const cached = require('cached');
const path = require("path");
const cache = cached('images', { backend: {
    type: 'memory'
}});


logger.level = 'info';

function getMatrixPath() {
    return path.join(__dirname, "..", 'matrix', 'matrix.jpg');
}


/*
  Insert the image in the matrix at the given row and column.
  The image is automatically resized according to the matrix size, the border and the padding thickness
 */
async function insertImage(imagePath, matrix, col, row, resolution) {
    const effectivePadding = p.Padding * (resolution / 100.);
    const iWidth = (matrix.getWidth() - 2 * p.BorderXpc * matrix.getWidth()) / p.NCols - 2 * effectivePadding;
    const iHeight = (matrix.getHeight() - 2 * p.BorderYpc * matrix.getHeight()) / p.NRows - 2 * effectivePadding;

    const step0 = Date.now();
    const img = await loadImageIfAny(imagePath, iWidth, iHeight);
    const step1 = Date.now();
    if (logger.isDebugEnabled())
        logger.debug("Image loaded and resized in " + (step1 - step0) + " milli seconds.");

    if (img != null) {
        const step2 = Date.now();
        matrix.blit(img, col * (iWidth + 2 * effectivePadding) + p.BorderXpc * matrix.getWidth() + effectivePadding, row * (iHeight + 2 * effectivePadding) + p.BorderYpc * matrix.getHeight() + effectivePadding);
        const step3 = Date.now();
        if (logger.isDebugEnabled())
            logger.debug("Image superimposed in " + (step3 - step2) + " milli seconds.");
    }
}

async function loadMatrix(resolution) {
    const img =  await cache.getOrElse(getMatrixPath(), async () => {
        const matrix = await Jimp.read(getMatrixPath());
        const width = matrix.getWidth();
        const height = matrix.getHeight();
        if(logger.isDebugEnabled())
            logger.debug(getMatrixPath() + "   width=" + width + "     height=" + height);
        matrix.resize(width * resolution/100, height * resolution/100);// optimize performance by downscaling the resolution
        return matrix;
    });
    return img.clone();
}

/*
  Load and image or return undefined in case of an exception
 */
function loadImageIfAny(path, width, height) {
    return cache.getOrElse(path, async () => {
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
exports.loadMatrix = loadMatrix;
