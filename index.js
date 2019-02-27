const generator = require('./util/random');
const imageProcessor = require('./util/image');
const p = require('./util/parameterization');


/*
  Generate an array containing 0 or a random number whose position is determined accordingly with its value
  (20 at second position, 50 at fifth and so on)
*/
function generateRowTemplate(numbers, row) {
    const rowValues = Array(p.NCols).fill(0);
    function resolveColNumber(number) {
        const colNumber = Math.floor(number / 10);
        if(colNumber >= p.NCols) return p.NCols - 1;
        return colNumber;
    }
    for (let col = 0; col < p.NNumbers; col++) {
        const number = numbers[row * p.NNumbers + col];
        rowValues[resolveColNumber(number)] = number;
    }
    return rowValues;
}

/*
  Superimpose images onto the matrix for the given row. Images are resolved according to the random number
  associated with the column. The first time a 0 is met, the pub image is superimposed.
*/
async function composeRow (matrix, pub, rowValues, row) {
    let pubAlreadyInserted = false;
    for (let col = 0; col < p.NCols; col++) {
        if (rowValues[col] > 0) {
            const img = await imageProcessor.loadImageIfAny(p.getImgPath(rowValues[col]));
            imageProcessor.insertImage(img, matrix, col, row);
        } else if (pub !== undefined && !pubAlreadyInserted) {
            imageProcessor.insertImage(pub, matrix, col, row);
            pubAlreadyInserted = true;
        }
    }
}

/*
  Generate a card
*/
async function generateOneCard() {
    const matrix = await imageProcessor.loadImageIfAny(p.getMatrixPath());// load the matrix image (empty card)
    const numbers = generator.randomValues(p.NRows * p.NNumbers);
    for (let row = 0; row < p.NRows; row ++) {
        const pub = await imageProcessor.loadImageIfAny(p.getPubPath(row + 1));// load pub image for the given row
        const rowValues = generateRowTemplate(numbers, row);
        await composeRow(matrix, pub, rowValues, row);
        console.log(rowValues.toString())
    }
    imageProcessor.write(matrix, p.getCardPath(1));// save the definitive card
}


generateOneCard();