const prompts = require('prompts');
const generator = require('./util/random');
const imageProcessor = require('./util/image');
const p = require('./util/parameterization');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const log4js = require('log4js');
const logger = log4js.getLogger('root');
logger.level = 'info';


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
async function composeRow (matrix, pubPath, rowValues, row) {
    let pubAlreadyInserted = false;
    for (let col = 0; col < p.NCols; col++) {
        if (rowValues[col] > 0) {
            const step0 = Date.now();
            await imageProcessor.insertImage(p.getImgPath(rowValues[col]), matrix, col, row);
            const step1 = Date.now();
            if(logger.isDebugEnabled())
                logger.debug("Image inserted in " + (step0 - step1) + " milli seconds.");
        } else if (!pubAlreadyInserted) {
            await imageProcessor.insertImage(pubPath, matrix, col, row);
            pubAlreadyInserted = true;
        }
    }
}

/*
  Generate a card. It takes approximately 1 second to process a card, that is due to i/o. Some lazy caching might be a good idea at image processor level.
  Note that it takes 2 seconds more to save the card !
*/
async function generateOneCard() {
    let matrix = await imageProcessor.loadImageIfAny(p.getMatrixPath());// load the matrix image (empty card)
    matrix = matrix.clone();// image might be cached
    const numbers = generator.randomValues(p.NRows * p.NNumbers);
    const start =  Date.now();
    for (let row = 0; row < p.NRows; row ++) {
        const step0 = Date.now();
        const step1 = Date.now();
        if(logger.isDebugEnabled())
            logger.debug("Pub image loaded in " + (step1 - step0) + " milli seconds.");
        const step2 = Date.now();
        const rowValues = generateRowTemplate(numbers, row);
        const step3 = Date.now();
        if(logger.isDebugEnabled())
            logger.debug("Template generated in " + (step3 - step2) + " milli seconds.");
        const step4 = Date.now();
        await composeRow(matrix, p.getPubPath(row + 1), rowValues, row);
        const step5 = Date.now();
        if(logger.isDebugEnabled())
            logger.debug("Row generated in " + (step5 - step4) + " milli seconds.");
    }

    if(logger.isDebugEnabled())
        logger.debug("Card processed in " + (Date.now() - start) + " milli seconds.");
    return matrix.getBufferAsync("image/jpeg");// getBuffer is a rather log process
}

/*
 Prompt for the number of cards the user wants to generate
 */
async function inputs() {
    let questions = [{
        type: 'number',
        name: 'value',
        message: 'Nombre de cartes (1000 maxi) ?',
        initial: 3,
        style: 'default',
        min: 1,
        max: 1000
    }];
    let response = await prompts(questions);
    return response.value;
}

async function main() {
    const ncards = await inputs();
    logger.info("About to generate " + ncards + " cards.");
    const start =  Date.now();
    const doc = new PDFDocument;
    const path = './out/output.pdf';
    try {
        doc.pipe(fs.createWriteStream(path));
        let counter = 0;
        for (let card = 0; card < ncards; card++) {
            const step0 = Date.now();
            const image = await generateOneCard();// we must block here...
            const step1 = Date.now();
            logger.info("Card inserted in pdf in " + (step1 - step0) + " milli seconds.");
            if (card % 3 === 0 && card > 0) {
                doc.addPage();
                counter = 0;
            }
            doc.image(image, 55, 55 + counter * 220, {width: 500});
            counter++;
        }
    } finally {
        doc.end();
    }
    logger.info(ncards + " cards processed and saved in " + Math.floor((Date.now() - start)/1000) + " seconds at path " + path + ".");
}

main();
