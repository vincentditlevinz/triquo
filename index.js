const prompts = require('prompts');
const generator = require('./util/random');
const imageProcessor = require('./util/image');
const p = require('./util/parameterization');
const PDFDocument = require('pdfkit');
const fs = require('fs');



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
  Generate a card. It takes approximately 1 second to process a card, that is due to i/o. Some lazy caching might be a good idea at image processor level.
  Note that it takes 2 seconds more to save the card !
*/
async function generateOneCard() {
    const matrix = await imageProcessor.loadImageIfAny(p.getMatrixPath());// load the matrix image (empty card)
    const numbers = generator.randomValues(p.NRows * p.NNumbers);
    const start =  Date.now();
    for (let row = 0; row < p.NRows; row ++) {
        const pub = await imageProcessor.loadImageIfAny(p.getPubPath(row + 1));// load pub image for the given row
        const rowValues = generateRowTemplate(numbers, row);
        await composeRow(matrix, pub, rowValues, row);
    }

    console.log("Card processed in " + (Date.now() - start) + " milli seconds.");
    return matrix.getBufferAsync("image/jpeg");
}

/*
 Prompt for the number of cards the user wants to generate
 */
async function inputs() {
    let questions = [{
        type: 'number',
        name: 'value',
        message: 'Nombre de cartes ?',
        initial: 3,
        style: 'default',
        min: 2,
        max: 10
    }];
    let response = await prompts(questions);
    return response.value;
}

async function main() {
    const ncards = await inputs();
    console.log("About to generate " + ncards + " cards.");
    const start =  Date.now();
    const doc = new PDFDocument;
    const path = './out/output.pdf';
    doc.pipe(fs.createWriteStream(path));
    let counter = 0;
    for (let card = 0; card < ncards; card++) {
        const image = await generateOneCard();
        if(card % 3 === 0 && card > 0) {
            doc.addPage();
            counter= 0;
        }
        doc.image(image, 55, 55 + counter * 220, {width: 500});
        counter ++;
    }
    doc.end();
    console.log(ncards + " cards processed and saved in " + Math.floor((Date.now() - start)/1000) + " seconds at path " + path + ".");
}

main();
