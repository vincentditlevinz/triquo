/*
  Encapsulate parameters in the context of TriqoLoto. Feel free to modify some values here.
 */

const NNumbers = 5, NCols = 9, NRows = 3;
const matrixWidth = 4817, matrixHeight=2021;// Should change if matrix image is modified in the future (enable debug logging to know the ne dimensions).
const BorderXpc = 125.0/matrixWidth, BorderYpc = 125.0/matrixHeight, Padding = 5;

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
exports.BorderXpc = BorderXpc;
exports.BorderYpc = BorderYpc;
exports.Padding = Padding;
exports.getImgPath = getImgPath;
exports.getPubPath = getPubPath;
exports.getMatrixPath = getMatrixPath;
exports.getCardPath = getCardPath;