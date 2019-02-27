/*
  Encapsulate parameters in the context of TriqoLoto. Feel free to modify some values here.
 */

const NNumbers = 5, NCols = 9, NRows = 3;

function getImgPath(number) {
    return './img/' + number + '.jpg';
}

function getPubPath(number) {
    return './pub/' + number + '.jpg';
}

function getMatrixPath() {
    return './matrix/card.jpg';
}

function getCardPath(number) {
    return './out/card' + number + '.jpg';
}

exports.NNumbers = NNumbers;
exports.NCols = NCols;
exports.NRows = NRows;
exports.getImgPath = getImgPath;
exports.getPubPath = getPubPath;
exports.getMatrixPath = getMatrixPath;
exports.getCardPath = getCardPath;