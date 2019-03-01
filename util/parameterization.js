/*
  Encapsulate parameters in the context of TriqoLoto. Feel free to modify some values here.
 */

const NNumbers = 5, NCols = 9, NRows = 3;
const matrixWidth = 4817, matrixHeight=2021;// Should change if matrix image is modified in the future (enable debug logging to know the ne dimensions).
const BorderXpc = 125.0/matrixWidth, BorderYpc = 125.0/matrixHeight, Padding = 5;

exports.NNumbers = NNumbers;
exports.NCols = NCols;
exports.NRows = NRows;
exports.BorderXpc = BorderXpc;
exports.BorderYpc = BorderYpc;
exports.Padding = Padding;