/*
  Encapsulate parameters in the context of TriqoLoto. Feel free to modify some values here.
 */

const NNumbers = 5, NCols = 9, NRows = 3;
const Border = 125, Padding = 5;

function getImgPath(number) {
    return './img/' + number + '.jpg';
}

function getPubPath(number) {
    return './pub/' + number + '.jpg';
}

function getMatrixPath() {
    return './matrix/matrix.jpg';
}

function getCardPath(number) {
    return './out/card' + number + '.jpg';
}

exports.NNumbers = NNumbers;
exports.NCols = NCols;
exports.NRows = NRows;
exports.Border = Border;
exports.Padding = Padding;
exports.getImgPath = getImgPath;
exports.getPubPath = getPubPath;
exports.getMatrixPath = getMatrixPath;
exports.getCardPath = getCardPath;