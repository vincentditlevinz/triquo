/*
  Encapsulate useful function for processing images in the context of TriqoLoto
 */

const Jimp = require('jimp');

/*
  Insert the image in the matrix at the given row and column.
  The image is automatically resized according to the matrix size, the border and the padding thickness
 */
function insertImage(img, matrix, col, row) {
    img.resize(80, 94, Jimp.RESIZE_BEZIER);// approximative resizing
    matrix.blit(img, col * (img.getWidth() + 1.1) + 33, row * (img.getHeight() + 1.1) + 25)// approximative rule
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
