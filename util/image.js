/*
  Encapsulate useful function for processing images in the context of TriqoLoto
 */

const Jimp = require('jimp');
const p = require('../util/parameterization');

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
    try {
        return await Jimp.read(path);
    } catch (e) {
        console.warn("No pub image with path " + path)
    }
    return undefined;
}

/*
  Write the image at the given path. Errors are catched.
 */
function write(image, path) {
    try {
        image.write(path);
    } catch (e) {
        console.error("Unable to write card at path " + path)
    }
}

exports.insertImage = insertImage;
exports.loadImageIfAny = loadImageIfAny;
exports.write = write;
