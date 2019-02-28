const Jimp = require('jimp');
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
async function generateOneCard(resolution) {
    let matrix = await imageProcessor.loadImageIfAny(p.getMatrixPath());// load the matrix image (empty card)
    matrix = matrix.clone();
    matrix.resize(matrix.getWidth() * resolution/100, matrix.getHeight() * resolution/100);// optimize performance by downscaling the resolution
    const template = generator.generateMatrixTemplate();
    const start =  Date.now();
    for (let row = 0; row < p.NRows; row ++) {
        const step0 = Date.now();
        const step1 = Date.now();
        if(logger.isDebugEnabled())
            logger.debug("Pub image loaded in " + (step1 - step0) + " milli seconds.");
        const step2 = Date.now();
        const rowValues = template[row];
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
    return matrix.getBufferAsync(Jimp.MIME_JPEG);// getBuffer is a rather log process
}

/*
 Prompt for the number of cards the user wants to generate
 */
async function inputs() {
    let questions = [{
            type: 'number',
            name: 'ncards',
            message: 'Nombre de cartes (1000 maxi) ?',
            initial: 3,
            style: 'default',
            min: 1,
            max: 10000
        },
        {
            type: 'number',
            name: 'resolution',
            message: 'Résolution des images en % ?',
            initial: 25,
            style: 'default',
            min: 1,
            max: 100
        }];
    return await prompts(questions);
}

/*
    Performances with default resolution (25%) => 100 cards in 75 s for a PDF file of 50 MO. Linear extrapolation means 10000 cards in 2 hours and a file of 5 GO.
 */
async function main() {
    const params = await inputs();
    logger.info("About to generate " + params.ncards + " cards.");
    const start =  Date.now();
    const doc = new PDFDocument;
    const path = './out/output.pdf';
    try {
        let images = Array(params.ncards);
        for (let card = 0; card < params.ncards; card++) {
            images[card] = generateOneCard(params.resolution);
        }

        const step0 = Date.now();
        images = await Promise.all(images);
        const step1 = Date.now();
        logger.info(params.ncards + " cards generated in " + (step1 - step0) + " milli seconds.");

        doc.pipe(fs.createWriteStream(path));
        let counter = 0;
        for (let card = 0; card < params.ncards; card++) {
            const image = images[card];// we must block here...
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
    logger.info(params.ncards + " cards processed and saved in " + Math.floor((Date.now() - start)/1000) + " seconds at path " + path + ".");
}

main();
