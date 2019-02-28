/*
  Encapsulate useful function for generating random values in the context of TriqoLoto
 */


const { Random, MersenneTwister19937 } = require("random-js");
const random = new Random(MersenneTwister19937.autoSeed());
const p = require('./parameterization');
let Set = require('collections/set');
const log4js = require('log4js');
const logger = log4js.getLogger('random');

const ref = new Set();


logger.level = 'info';


/*
  Generate a number that is guaranteed to be within [1, 90] without any particular bias.
*/
function generate1To90RandomValue() {
    return random.integer(1, 90);
}

function resolveColNumber(number) {
    const colNumber = Math.floor(number / 10);
    if(colNumber >= p.NCols) return p.NCols - 1;
    return colNumber;
}

/*
  Generate an array of p.NCols length populated with p.NNumbers unique random values. Each row is unique for the whole process (ie for all generated cards). No duplicate in the same card.
*/
function randomValues(refPerCard) {
    let rowSignature;
    const row = Array(p.NCols).fill(0);
    let duplicate = 0;
    while(rowSignature === undefined || ref.has(rowSignature)) {
        if(duplicate > 0) {
            logger.info("Duplicated row detected, one generates another one.");
        }
        let counter = 0;
        while (counter < p.NNumbers) {
            const number = generate1To90RandomValue();
            const index = resolveColNumber(number);
            if (row[index] <= 0 && !refPerCard.has(number)) {
                row[index] = number;
                refPerCard.add(number);
                counter++;
            }
        }
        rowSignature = row.join('');
        duplicate ++;
    }
    ref.add(rowSignature);
    return row;
}

/*
  Generate an array of p.Rows * p.NCols. Each row contains 0 or a random value between in the [1, 90] range. There is p.NNumbers columns with a random value.
  A random value is associated to a column if it correspond to a base 10 distribution. Ex: column 1 = numbers in the range [1, 9], column 2 = numbers in the range [10, 19], and so on.
  A random value is unique in a card. A row is unique for all generated cards.
*/
function generateMatrixTemplate() {
    const refPerCard = new Set();
    return Array(p.NRows).fill(0).map(() => randomValues(refPerCard));
}

exports.generateMatrixTemplate = generateMatrixTemplate;
