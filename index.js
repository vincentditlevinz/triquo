const Jimp = require('jimp');
const prompts = require('prompts');
const generator = require('./util/random');
const processor = require('./util/image');
const p = require('./util/parameterization');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require("path");
const log4js = require('log4js');
const logger = log4js.getLogger('root');
logger.level = 'info';

function getImgPath(number) {
    return path.join(__dirname, 'img' , number + '.jpg');
}

function getPubPath(number) {
    return path.join(process.cwd(), 'pub', number + '.jpg');
}


function getOutputPath() {
    return path.join(process.cwd(), 'output.pdf');
}

/*
  Superimpose images onto the matrix for the given row. Images are resolved according to the random number
  associated with the column. The first time a 0 is met, the pub image is superimposed.
*/
async function composeRow (matrix, pubPath, rowValues, row, resolution) {
    let pubAlreadyInserted = false;
    for (let col = 0; col < p.NCols; col++) {
        if (rowValues[col] > 0) {
            const step0 = Date.now();
            await processor.insertImage(getImgPath(rowValues[col]), matrix, col, row, resolution);
            const step1 = Date.now();
            if(logger.isDebugEnabled())
                logger.debug("Image inserted in " + (step0 - step1) + " milli seconds.");
        } else if (!pubAlreadyInserted) {
            await processor.insertImage(pubPath, matrix, col, row, resolution);
            pubAlreadyInserted = true;
        }
    }
}

/*
  Generates one card.
*/
async function generateOneCard(resolution) {
    const matrix = await processor.loadMatrix(resolution);
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
        await composeRow(matrix, getPubPath(row + 1), rowValues, row, resolution);
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
            message: 'Nombre de cartes ?',
            initial: 3,
            style: 'default',
            min: 1,
            max: 50000
        },
        {
            type: 'number',
            name: 'resolution',
            message: 'Résolution des images en % ?',
            initial: 25,
            style: 'default',
            min: 1,
            max: 100
        }
        ,
        {
            type: 'number',
            name: 'batchsz',
            message: 'Taille des lots (une valeur élevée utilise plus de mémoire) ?',
            initial: 600,
            style: 'default',
            min: 3,
            max: 999,
            increment: 3,
            validate: batchsz => batchsz % 3 !== 0 ? `La taille du lot doit être divisible par 3` : true
        }];
    return await prompts(questions);
}

async function processBatch(doc, resolution, batchSize) {
    let images = Array(batchSize);
    for (let card = 0; card < batchSize; card++) {
        images[card] = generateOneCard(resolution);
    }
    const step0 = Date.now();
    images = await Promise.all(images);
    const step1 = Date.now();
    logger.info(batchSize + " cards generated in " + (step1 - step0) + " milli seconds.");

    let counter = 0;
    for (let card = 0; card < batchSize; card++) {
        const image = images[card];
        doc.image(image, 55, 55 + counter  * 220, {width: 500});
        counter++;
        if (counter % 3 === 0 && (card + 1) !== batchSize ) {
            doc.addPage();
            counter = 0;
        }

    }
}

/*
    Performances with default resolution (25%) => 1000 cards in 220 s for a PDF file of 484 MO. Linear extrapolation means 10000 cards in 37 min and a file of 5 GO.
 */
async function main() {
    logger.info("====================================================================================================================================" );
    logger.info("Cette application permet de générer des cartes de loto ludiques. Un fichier output.pdf est généré dans le répertoire d'exécution.  " );
    logger.info("Il est possible d'insérer jusqu'à trois images publicitaires pour personnaliser les cartons de loto. Il sufft de créer un dossier  " );
    logger.info("'pub' et d'y ajouter les fichiers 1.jpg, 2.jpg, 3.jpg. L'absence d'un de ces fichiers implique 'pas de pub' à la ligne concernée.  " );
    logger.info("Performances observées (res=25, 1000 cartes, batch=600): 220s pour un pdf de 484 MO, soit 27 min pour 10000 cartes et 5GO de sortie" );
    logger.info("====================================================================================================================================" );
    const params = await inputs();
    logger.info("About to generate " + params.ncards + " cards.");
    const start =  Date.now();
    const doc = new PDFDocument;
    const path = getOutputPath();

    function resolveBatchSize(iter) {
        let batchSize = params.ncards - params.batchsz * iter;
        if (batchSize <= 0)
            batchSize = params.ncards;
        if (batchSize > params.batchsz)
            batchSize = params.batchsz;
        return batchSize;
    }

    try {
        doc.pipe(fs.createWriteStream(path));
        const nIter = Math.floor(params.ncards/ params.batchsz) + 1;
        for (let iter = 0; iter < nIter; iter ++) {
            const size = resolveBatchSize(iter);
            logger.info("Batch iteration: " + iter + "        size: " + size);
            await processBatch(doc, params.resolution, size);
        }
    } finally {
        doc.end();
    }
    logger.info(params.ncards + " cards processed and saved in " + Math.floor((Date.now() - start)/1000) + " seconds at path " + path + ".");
}

main();
