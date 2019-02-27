const Jimp = require('jimp');
const { Random, MersenneTwister19937 } = require("random-js");
const random = new Random(MersenneTwister19937.autoSeed());
const NNumbers = 5, NCols = 9, NRows = 3;

// generate a number that is guaranteed to be within [1, 90] without any particular bias.
function generate1To90RandomValue() {
    return random.integer(1, 90);
}

function getPath(number) {
    return './img/' + number + '.jpg';
}

function getPubPath(number) {
    return './pub/' + number + '.jpg';
}

function resolveColNumber(number) {
    const colNumber = Math.floor(number / 10);
    if(colNumber >= NCols) return NCols - 1;
    return colNumber;
}

function randomValues() {
    const nums = new Set();
    while(nums.size !== NRows * NNumbers) {
        nums.add(generate1To90RandomValue())
    }
    return Array.from(nums);
}

function generateRowTemplate(numbers, row) {
    const rowValues = Array(NCols).fill(0);
    for (let col = 0; col < NNumbers; col++) {
        const number = numbers[row * NNumbers + col];
        rowValues[resolveColNumber(number)] = number;
    }
    return rowValues;
}

function insertImage(img, matrix, col, row) {
    img.resize(80, 94, Jimp.RESIZE_BEZIER);// approximative resizing
    matrix.blit(img, col * (img.getWidth() + 1.1) + 33, row * (img.getHeight() + 1.1) + 25)// approximative rule
}

async function generateOneCardImage() {
    const matrix = await Jimp.read('./matrix/card.jpg');
    const numbers = randomValues();
    for (let row = 0; row < NRows; row ++) {
        let pub = 'No Image';
        try {
            pub = await Jimp.read(getPubPath(row + 1));
        } catch (e) {
            console.warn("No pub image for row " + (row + 1))
        }
        const rowValues = generateRowTemplate(numbers, row);

        let pubAlreadyInserted = false;
        for (let col = 0; col < NCols; col ++) {
            if(rowValues[col] > 0) {
                const img = await Jimp.read(getPath(rowValues[col]));
                insertImage(img, matrix, col, row);
            } else if(pub !== 'No Image' && !pubAlreadyInserted) {
                insertImage(pub, matrix, col, row);
                pubAlreadyInserted = true;
            }
        }
        matrix.write('./out/card1.jpg');
        console.log(rowValues.toString())
    }
}


generateOneCardImage();

//main();